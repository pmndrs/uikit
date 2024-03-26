import { Group, InstancedBufferAttribute, Material, Usage, DynamicDrawUsage } from 'three'
import {
  Bucket,
  addToSortedBuckets,
  removeFromSortedBuckets,
  updateSortedBucketsAllocation,
  resizeSortedBucketsSpace,
} from '../allocation/sorted-buckets.js'
import { panelMaterialDefaultData } from './panel-material.js'
import { InstancedPanel } from './instanced-panel.js'
import { InstancedPanelMesh } from './instanced-panel-mesh.js'
import { CameraDistanceRef, OrderInfo, setupRenderOrder } from '../order.js'

export class InstancedPanelGroup extends Group {
  private mesh?: InstancedPanelMesh
  public instanceMatrix!: InstancedBufferAttribute
  public instanceData!: InstancedBufferAttribute
  public instanceClipping!: InstancedBufferAttribute

  private buckets: Array<Bucket<InstancedPanel>> = []
  private elementCount: number = 0
  private bufferElementSize: number = 0
  private timeToNextUpdate: number | undefined

  private activateElement = (element: InstancedPanel, bucket: Bucket<InstancedPanel>, indexInBucket: number) => {
    const index = bucket.offset + indexInBucket
    this.instanceData.set(panelMaterialDefaultData, 16 * index)
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
    private readonly instanceMaterial: Material,
    public readonly pixelSize: number,
    private readonly cameraDistance: CameraDistanceRef,
    private readonly orderInfo: OrderInfo,
    private readonly meshReceiveShadow: boolean,
    private readonly meshCastShadow: boolean,
  ) {
    super()
  }

  private updateCount(): void {
    const lastBucket = this.buckets[this.buckets.length - 1]
    const count = lastBucket.offset + lastBucket.elements.length
    if (this.mesh != null) {
      this.mesh.count = count
    }
    this.visible = count > 0
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
      this.visible = false
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
    this.visible = true
  }

  private resize(): void {
    const oldBufferSize = this.bufferElementSize
    this.bufferElementSize = Math.ceil(this.elementCount * 1.5)
    if (this.mesh != null) {
      this.mesh.dispose()
      this.remove(this.mesh)
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
    this.instanceData.setUsage(DynamicDrawUsage)
    const clippingArray = new Float32Array(this.bufferElementSize * 16)
    if (this.instanceClipping != null) {
      clippingArray.set(this.instanceClipping.array.subarray(0, clippingArray.length))
    }
    this.instanceClipping = new InstancedBufferAttribute(clippingArray, 16, false)
    this.instanceClipping.setUsage(DynamicDrawUsage)
    this.mesh = new InstancedPanelMesh(this.instanceMatrix, this.instanceData, this.instanceClipping)
    setupRenderOrder(this.mesh, this.cameraDistance, this.orderInfo)
    this.mesh.material = this.instanceMaterial
    this.mesh.receiveShadow = this.meshReceiveShadow
    this.mesh.castShadow = this.meshCastShadow
    this.add(this.mesh)
  }

  destroy(): void {}
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
