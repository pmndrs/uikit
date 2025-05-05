import { InstancedBufferAttribute, Material, DynamicDrawUsage, MeshBasicMaterial, Object3D } from 'three'
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
import { ElementType, OrderInfo, WithReversePainterSortStableCache, setupRenderOrder } from '../order.js'
import { Signal, computed } from '@preact/signals-core'
import { MergedProperties } from '../properties/merged.js'
import { RootContext } from '../context.js'

export type ShadowProperties = {
  receiveShadow?: boolean
  castShadow?: boolean
}

export type RenderProperties = {
  depthWrite?: boolean
  depthTest?: boolean
  renderOrder?: number
}

export type PanelGroupProperties = {
  panelMaterialClass?: MaterialClass
} & ShadowProperties &
  RenderProperties

export function computedPanelGroupDependencies(propertiesSignal: Signal<MergedProperties>) {
  return computed<Required<PanelGroupProperties>>(() => {
    const properties = propertiesSignal.value
    return {
      panelMaterialClass: properties.read('panelMaterialClass', MeshBasicMaterial),
      castShadow: properties.read('castShadow', false),
      receiveShadow: properties.read('receiveShadow', false),
      depthWrite: properties.read('depthWrite', false),
      depthTest: properties.read('depthTest', true),
      renderOrder: properties.read('renderOrder', 0),
    }
  })
}

export class PanelGroupManager {
  private map = new Map<MaterialClass, Map<string, InstancedPanelGroup>>()

  constructor(
    private readonly root: WithReversePainterSortStableCache &
      Pick<RootContext, 'onFrameSet' | 'requestFrame' | 'requestRender' | 'pixelSize'>,
    private readonly objectRef: { current?: Object3D | null },
  ) {}

  init(abortSignal: AbortSignal) {
    const onFrame = () => this.traverse((group) => group.onFrame())
    this.root.onFrameSet.add(onFrame)
    abortSignal.addEventListener('abort', () => {
      this.root.onFrameSet.delete(onFrame)
      this.traverse((group) => group.destroy())
    })
  }

  private traverse(fn: (group: InstancedPanelGroup) => void) {
    for (const groups of this.map.values()) {
      for (const group of groups.values()) {
        fn(group)
      }
    }
  }

  getGroup(majorIndex: number, properties: Required<PanelGroupProperties>) {
    let groups = this.map.get(properties.panelMaterialClass)
    if (groups == null) {
      this.map.set(properties.panelMaterialClass, (groups = new Map()))
    }
    const key = [
      majorIndex,
      properties.renderOrder,
      properties.depthTest,
      properties.depthWrite,
      properties.receiveShadow,
      properties.castShadow,
    ].join(',')
    let panelGroup = groups.get(key)
    if (panelGroup == null) {
      groups.set(
        key,
        (panelGroup = new InstancedPanelGroup(
          this.objectRef.current!,
          this.root,
          {
            elementType: ElementType.Panel,
            majorIndex,
            minorIndex: 0,
          },
          properties,
        )),
      )
    }
    return panelGroup
  }
}

const nextFrame = Symbol('nextFrame')

export class InstancedPanelGroup {
  private mesh?: InstancedPanelMesh
  public instanceMatrix!: InstancedBufferAttribute
  public instanceData!: InstancedBufferAttribute
  public instanceClipping!: InstancedBufferAttribute
  private readonly instanceMaterial: Material

  private buckets: Array<Bucket<InstancedPanel>> = []
  private elementCount: number = 0
  private bufferElementSize: number = 0

  public instanceDataOnUpdate!: InstancedBufferAttribute['addUpdateRange']

  private nextUpdateTime: typeof nextFrame | number | undefined
  private nextUpdateTimeoutRef: NodeJS.Timeout | undefined

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
    private readonly object: Object3D,
    public readonly root: WithReversePainterSortStableCache &
      Pick<RootContext, 'requestFrame' | 'requestRender' | 'pixelSize'>,
    private readonly orderInfo: OrderInfo,
    private readonly panelGroupProperties: Required<PanelGroupProperties>,
  ) {
    this.instanceMaterial = createPanelMaterial(panelGroupProperties.panelMaterialClass, { type: 'instanced' })
    this.instanceMaterial.depthTest = panelGroupProperties.depthTest
    this.instanceMaterial.depthWrite = panelGroupProperties.depthWrite
  }

  private updateCount(): void {
    const lastBucket = this.buckets[this.buckets.length - 1]
    const count = lastBucket.offset + lastBucket.elements.length
    if (this.mesh == null) {
      return
    }
    this.mesh.count = count
    this.mesh.visible = count > 0
    this.root.requestRender()
  }

  private requestUpdate(time: number): void {
    if (this.nextUpdateTime == nextFrame) {
      return
    }

    const forTime = performance.now() + time

    if (this.nextUpdateTime != null && this.nextUpdateTime < forTime) {
      return
    }
    this.nextUpdateTime = forTime
    clearTimeout(this.nextUpdateTimeoutRef)
    this.nextUpdateTimeoutRef = setTimeout(this.requestUpdateNextFrame.bind(this), time)
  }

  private requestUpdateNextFrame() {
    this.nextUpdateTime = nextFrame
    clearTimeout(this.nextUpdateTimeoutRef)
    this.nextUpdateTimeoutRef = undefined
    this.root.requestFrame()
  }

  insert(bucketIndex: number, panel: InstancedPanel): void {
    this.elementCount += 1
    if (!addToSortedBuckets(this.buckets, bucketIndex, panel, this.activateElement)) {
      this.updateCount()
      return
    }
    this.requestUpdateNextFrame()
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
      //update count already requests a render
      this.updateCount()
      return
    }
    this.root.requestRender()
    this.requestUpdate(1000) //request update in 1 second
  }

  onFrame(): void {
    if (this.nextUpdateTime != nextFrame) {
      return
    }
    this.nextUpdateTime = undefined
    this.update()
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
      //we need to execute updateSortedBucketsAllocation after resize so that updateSortedBucketsAllocation has enough space to arrange all the elements
      updateSortedBucketsAllocation(this.buckets, this.activateElement, this.bufferCopyWithin)
    } else if (this.elementCount <= this.bufferElementSize / 3) {
      //we need to execute updateSortedBucketsAllocation first, so we still have access to the elements in the space that will be removed by the resize
      //TODO: this could be improved since now we are re-arraging in place and then copying. we could rearrange while copying. Not sure if faster though?
      updateSortedBucketsAllocation(this.buckets, this.activateElement, this.bufferCopyWithin)
      //buffer is at least 300% bigger than the needed space
      this.resize()
    } else {
      updateSortedBucketsAllocation(this.buckets, this.activateElement, this.bufferCopyWithin)
    }
    this.mesh!.count = this.elementCount
    this.mesh!.visible = true
  }

  private resize(): void {
    const oldBufferSize = this.bufferElementSize
    this.bufferElementSize = Math.ceil(this.elementCount * 1.5)
    if (this.mesh != null) {
      this.mesh.dispose()
      this.object.remove(this.mesh)
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
    this.mesh.renderOrder = this.panelGroupProperties.renderOrder
    setupRenderOrder(this.mesh, this.root, { value: this.orderInfo })
    this.mesh.material = this.instanceMaterial
    this.mesh.receiveShadow = this.panelGroupProperties.receiveShadow
    this.mesh.castShadow = this.panelGroupProperties.castShadow
    this.object.add(this.mesh)
  }

  destroy() {
    clearTimeout(this.nextUpdateTimeoutRef)
    if (this.mesh == null) {
      return
    }
    this.object.remove(this.mesh)
    this.mesh?.dispose()
    this.instanceMaterial.dispose()
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
