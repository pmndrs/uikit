import { InstancedBufferAttribute, Material, DynamicDrawUsage, MeshBasicMaterial } from 'three'
import {
  Bucket,
  addToSortedBuckets,
  removeFromSortedBuckets,
  updateSortedBucketsAllocation,
  resizeSortedBucketsSpace,
} from '../allocation/sorted-buckets.js'
import { MaterialClass, createPanelMaterial } from './panel-material.js'
import { InstancedPanel } from './instanced-panel.js'
import { InstancedPanelMesh } from './instanced-panel-mesh.js'
import { ElementType, OrderInfo, WithCameraDistance, setupRenderOrder } from '../order.js'
import { Signal, computed, effect } from '@preact/signals-core'
import { MergedProperties } from '../properties/merged.js'
import { Object3DRef, RootContext } from '../context.js'
import { Initializers } from '../utils.js'
import { computedProperty } from '../properties/index.js'

export type ShadowProperties = {
  receiveShadow?: boolean
  castShadow?: boolean
}

export type PanelGroupProperties = {
  panelMaterialClass?: MaterialClass
} & ShadowProperties

export function computedPanelGroupDependencies(propertiesSignal: Signal<MergedProperties>) {
  const panelMaterialClass = computedProperty(propertiesSignal, 'panelMaterialClass', MeshBasicMaterial)
  const castShadow = computedProperty(propertiesSignal, 'castShadow', false)
  const receiveShadow = computedProperty(propertiesSignal, 'receiveShadow', false)
  return computed<Required<PanelGroupProperties>>(() => ({
    panelMaterialClass: panelMaterialClass.value,
    castShadow: castShadow.value,
    receiveShadow: receiveShadow.value,
  }))
}

export const defaultPanelDependencies: Required<PanelGroupProperties> = {
  panelMaterialClass: MeshBasicMaterial,
  castShadow: false,
  receiveShadow: false,
}

export class PanelGroupManager {
  private map = new Map<MaterialClass, Map<number, InstancedPanelGroup>>()

  constructor(
    private renderOrder: Signal<number>,
    private depthTest: Signal<boolean>,
    private pixelSize: Signal<number>,
    private root: WithCameraDistance & Pick<RootContext, 'onFrameSet'>,
    private object: Object3DRef,
    initializers: Initializers,
  ) {
    initializers.push(
      () => {
        const onFrame = (delta: number) => this.traverse((group) => group.onFrame(delta))
        root.onFrameSet.add(onFrame)
        return () => root.onFrameSet.delete(onFrame)
      },
      () =>
        effect(() => {
          const ro = renderOrder.value
          this.traverse((group) => group.setRenderOrder(ro))
        }),
      () =>
        effect(() => {
          const dt = depthTest.value
          this.traverse((group) => group.setDepthTest(dt))
        }),
    )
  }

  private traverse(fn: (group: InstancedPanelGroup) => void) {
    for (const groups of this.map.values()) {
      for (const group of groups.values()) {
        fn(group)
      }
    }
  }

  getGroup(
    majorIndex: number,
    { panelMaterialClass, receiveShadow, castShadow }: Required<PanelGroupProperties> = defaultPanelDependencies,
  ) {
    let groups = this.map.get(panelMaterialClass)
    if (groups == null) {
      this.map.set(panelMaterialClass, (groups = new Map()))
    }
    const key = (majorIndex << 2) + ((receiveShadow ? 1 : 0) << 1) + (castShadow ? 1 : 0)
    let panelGroup = groups.get(key)
    if (panelGroup == null) {
      groups.set(
        key,
        (panelGroup = new InstancedPanelGroup(
          this.renderOrder.peek(),
          this.depthTest.peek(),
          this.object,
          panelMaterialClass,
          this.pixelSize,
          this.root,
          {
            elementType: ElementType.Panel,
            majorIndex,
            minorIndex: 0,
          },
          receiveShadow,
          castShadow,
        )),
      )
    }
    return panelGroup
  }
}

export class InstancedPanelGroup {
  private mesh?: InstancedPanelMesh
  public instanceMatrix!: InstancedBufferAttribute
  public instanceData!: InstancedBufferAttribute
  public instanceClipping!: InstancedBufferAttribute
  private readonly instanceMaterial: Material

  private buckets: Array<Bucket<InstancedPanel>> = []
  private elementCount: number = 0
  private bufferElementSize: number = 0
  private timeToNextUpdate: number | undefined

  public instanceDataOnUpdate!: InstancedBufferAttribute['addUpdateRange']

  private activateElement = (element: InstancedPanel, bucket: Bucket<InstancedPanel>, indexInBucket: number) => {
    const index = bucket.offset + indexInBucket
    this.instanceData.set(element.materialConfig.defaultData, 16 * index)
    this.instanceData.addUpdateRange(16 * index, 16)
    this.instanceData.needsUpdate = true
    element.activate(bucket, indexInBucket)
  }

  private setElementIndex = (element: InstancedPanel, index: number) => {
    element.setIndexInBucket(index)
  }

  private bufferCopyWithin = (targetIndex: number, startIndex: number, endIndex: number) => {
    copyWithinAttribute(this.instanceMatrix, targetIndex, startIndex, endIndex)
    copyWithinAttribute(this.instanceData, targetIndex, startIndex, endIndex)
    copyWithinAttribute(this.instanceClipping, targetIndex, startIndex, endIndex)
  }

  private clearBufferAt = (index: number) => {
    //hiding the element by writing a 0 matrix (0 scale ...)
    const bufferOffset = index * 16
    this.instanceMatrix.array.fill(0, bufferOffset, bufferOffset + 16)
    this.instanceMatrix.addUpdateRange(bufferOffset, 16)
    this.instanceMatrix.needsUpdate = true
  }

  constructor(
    private renderOrder: number,
    depthTest: boolean,
    private readonly object: Object3DRef,
    materialClass: MaterialClass,
    public readonly pixelSize: Signal<number>,
    private readonly root: WithCameraDistance,
    private readonly orderInfo: OrderInfo,
    private readonly meshReceiveShadow: boolean,
    private readonly meshCastShadow: boolean,
  ) {
    this.instanceMaterial = createPanelMaterial(materialClass, { type: 'instanced' })
    this.instanceMaterial.depthTest = depthTest
  }

  private updateCount(): void {
    const lastBucket = this.buckets[this.buckets.length - 1]
    const count = lastBucket.offset + lastBucket.elements.length
    if (this.mesh == null) {
      return
    }
    this.mesh.count = count
    this.mesh.visible = count > 0
  }

  setDepthTest(depthTest: boolean) {
    this.instanceMaterial.depthTest = depthTest
  }

  setRenderOrder(renderOrder: number) {
    this.renderOrder = renderOrder
    if (this.mesh == null) {
      return
    }
    this.mesh.renderOrder = renderOrder
  }

  insert(bucketIndex: number, panel: InstancedPanel): void {
    this.elementCount += 1
    if (!addToSortedBuckets(this.buckets, bucketIndex, panel, this.activateElement)) {
      this.updateCount()
      return
    }
    this.requestUpdate(0)
  }

  delete(bucketIndex: number, elementIndex: number | undefined, panel: InstancedPanel): void {
    this.elementCount -= 1
    if (
      !removeFromSortedBuckets(
        this.buckets,
        bucketIndex,
        panel,
        elementIndex,
        this.activateElement,
        this.clearBufferAt,
        this.setElementIndex,
        this.bufferCopyWithin,
      )
    ) {
      this.updateCount()
      return
    }
    this.requestUpdate(1000) //request update in 1 second
  }

  onFrame(delta: number): void {
    if (this.timeToNextUpdate == null) {
      return
    }
    this.timeToNextUpdate -= delta
    if (this.timeToNextUpdate > 0) {
      return
    }
    this.update()
    this.timeToNextUpdate = undefined
  }

  private requestUpdate(time: number): void {
    this.timeToNextUpdate = Math.min(this.timeToNextUpdate ?? Infinity, time)
  }

  private update(): void {
    if (this.elementCount === 0) {
      if (this.mesh != null) {
        this.mesh.visible = false
      }
      return
    }
    //buffer is resized to have space for 150% of the actually needed elements
    if (this.elementCount > this.bufferElementSize) {
      //buffer is to small to host the current elements
      this.resize()
    } else if (this.elementCount <= this.bufferElementSize / 3) {
      //buffer is at least 300% bigger than the needed space
      this.resize()
    }
    updateSortedBucketsAllocation(this.buckets, this.activateElement, this.bufferCopyWithin)
    this.mesh!.count = this.elementCount
    this.mesh!.visible = true
  }

  private resize(): void {
    const oldBufferSize = this.bufferElementSize
    this.bufferElementSize = Math.ceil(this.elementCount * 1.5)
    if (this.mesh != null) {
      this.mesh.dispose()
      this.object.current?.remove(this.mesh)
    }
    resizeSortedBucketsSpace(this.buckets, oldBufferSize, this.bufferElementSize)
    const matrixArray = new Float32Array(this.bufferElementSize * 16)
    if (this.instanceMatrix != null) {
      matrixArray.set(this.instanceMatrix.array.subarray(0, matrixArray.length))
    }
    this.instanceMatrix = new InstancedBufferAttribute(matrixArray, 16, false)
    this.instanceMatrix.setUsage(DynamicDrawUsage)
    const dataArray = new Float32Array(this.bufferElementSize * 16)
    if (this.instanceData != null) {
      dataArray.set(this.instanceData.array.subarray(0, dataArray.length))
    }
    this.instanceData = new InstancedBufferAttribute(dataArray, 16, false)
    this.instanceDataOnUpdate = (start, count) => {
      this.instanceData.addUpdateRange(start, count)
      this.instanceData.needsUpdate = true
    }
    this.instanceData.setUsage(DynamicDrawUsage)
    const clippingArray = new Float32Array(this.bufferElementSize * 16)
    if (this.instanceClipping != null) {
      clippingArray.set(this.instanceClipping.array.subarray(0, clippingArray.length))
    }
    this.instanceClipping = new InstancedBufferAttribute(clippingArray, 16, false)
    this.instanceClipping.setUsage(DynamicDrawUsage)
    this.mesh = new InstancedPanelMesh(this.instanceMatrix, this.instanceData, this.instanceClipping)
    this.mesh.renderOrder = this.renderOrder
    setupRenderOrder(this.mesh, this.root, { value: this.orderInfo })
    this.mesh.material = this.instanceMaterial
    this.mesh.receiveShadow = this.meshReceiveShadow
    this.mesh.castShadow = this.meshCastShadow
    this.object.current?.add(this.mesh)
  }
}

function copyWithinAttribute(
  attribute: InstancedBufferAttribute,
  targetIndex: number,
  startIndex: number,
  endIndex: number,
) {
  const itemSize = attribute.itemSize
  const start = startIndex * itemSize
  const end = endIndex * itemSize
  const target = targetIndex * itemSize
  attribute.array.copyWithin(target, start, end)
  const count = end - start
  attribute.addUpdateRange(start, count)
  attribute.addUpdateRange(target, count)
  attribute.needsUpdate = true
}
