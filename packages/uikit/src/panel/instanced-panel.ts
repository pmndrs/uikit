import { Signal, signal, effect } from '@preact/signals-core'
import { Matrix4, Vector2Tuple } from 'three'
import { Bucket } from '../allocation/sorted-buckets.js'
import { ClippingRect, defaultClippingData } from '../clipping.js'
import { Inset } from '../flex/node.js'
import { InstancedPanelGroup, PanelGroupManager, PanelGroupProperties } from './instanced-panel-group.js'
import { abortableEffect, ColorRepresentation } from '../utils.js'
import { MergedProperties } from '../properties/merged.js'
import { setupImmediateProperties } from '../properties/immediate.js'
import { OrderInfo } from '../order.js'
import { PanelMaterialConfig } from './panel-material.js'

export type PanelProperties = {
  borderTopLeftRadius?: number
  borderTopRightRadius?: number
  borderBottomLeftRadius?: number
  borderBottomRightRadius?: number
  backgroundOpacity?: number
  backgroundColor?: ColorRepresentation
  borderColor?: ColorRepresentation
  borderBend?: number
  borderOpacity?: number
}

export function setupInstancedPanel(
  propertiesSignal: Signal<MergedProperties>,
  orderInfo: Signal<OrderInfo | undefined>,
  panelGroupDependencies: Signal<Required<PanelGroupProperties>>,
  panelGroupManager: PanelGroupManager,
  matrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  offset: Signal<Vector2Tuple> | undefined,
  borderInset: Signal<Inset | undefined>,
  clippingRect: Signal<ClippingRect | undefined> | undefined,
  isVisible: Signal<boolean>,
  materialConfig: PanelMaterialConfig,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    if (orderInfo.value == null) {
      return
    }
    const innerAbortController = new AbortController()
    const group = panelGroupManager.getGroup(orderInfo.value.majorIndex, panelGroupDependencies.value)
    new InstancedPanel(
      propertiesSignal,
      group,
      orderInfo.value.minorIndex,
      matrix,
      size,
      offset,
      borderInset,
      clippingRect,
      isVisible,
      materialConfig,
      innerAbortController.signal,
    )
    return () => innerAbortController.abort()
  }, abortSignal)
}

const matrixHelper1 = new Matrix4()
const matrixHelper2 = new Matrix4()

export class InstancedPanel {
  private indexInBucket?: number
  private bucket?: Bucket<unknown>

  private insertedIntoGroup = false

  private active = signal<boolean>(false)
  private abortController?: AbortController

  constructor(
    propertiesSignal: Signal<MergedProperties>,
    private group: InstancedPanelGroup,
    private readonly minorIndex: number,
    private readonly matrix: Signal<Matrix4 | undefined>,
    private readonly size: Signal<Vector2Tuple | undefined>,
    private readonly offset: Signal<Vector2Tuple> | undefined,
    private readonly borderInset: Signal<Inset | undefined>,
    private readonly clippingRect: Signal<ClippingRect | undefined> | undefined,
    isVisible: Signal<boolean>,
    public readonly materialConfig: PanelMaterialConfig,
    abortSignal: AbortSignal,
  ) {
    const setters = materialConfig.setters
    setupImmediateProperties(
      propertiesSignal,
      this.active,
      materialConfig.hasProperty,
      (key, value) => {
        const index = this.getIndexInBuffer()
        if (index == null) {
          return
        }
        const { instanceData, instanceDataOnUpdate: instanceDataAddUpdateRange, root } = this.group
        setters[key](instanceData.array, instanceData.itemSize * index, value, size, instanceDataAddUpdateRange)
        root.requestRender()
      },
      abortSignal,
    )
    const isPanelVisible = materialConfig.computedIsVisibile(propertiesSignal, borderInset, size, isVisible)
    abortableEffect(() => {
      if (isPanelVisible.value) {
        this.requestShow()
        return
      }
      this.hide()
    }, abortSignal)
    abortSignal.addEventListener('abort', () => this.hide())
  }

  setIndexInBucket(index: number): void {
    this.indexInBucket = index
  }

  private getIndexInBuffer(): number | undefined {
    if (this.bucket == null || this.indexInBucket == null) {
      return undefined
    }
    return this.bucket.offset + this.indexInBucket
  }

  public activate(bucket: Bucket<unknown>, index: number): void {
    this.bucket = bucket
    this.indexInBucket = index
    this.active.value = true
    this.abortController = new AbortController()
    abortableEffect(() => {
      if (this.matrix.value == null || this.size.value == null) {
        return
      }
      const index = this.getIndexInBuffer()
      if (index == null) {
        return
      }
      const arrayIndex = index * 16
      const [width, height] = this.size.value
      const pixelSize = this.group.root.pixelSize.value
      matrixHelper1.makeScale(width * pixelSize, height * pixelSize, 1)
      if (this.offset != null) {
        const [x, y] = this.offset.value
        matrixHelper1.premultiply(matrixHelper2.makeTranslation(x * pixelSize, y * pixelSize, 0))
      }
      matrixHelper1.premultiply(this.matrix.value)
      const { instanceMatrix, root } = this.group
      matrixHelper1.toArray(instanceMatrix.array, arrayIndex)
      instanceMatrix.addUpdateRange(arrayIndex, 16)
      instanceMatrix.needsUpdate = true
      root.requestRender()
    }, this.abortController.signal)
    abortableEffect(() => {
      const index = this.getIndexInBuffer()
      if (index == null || this.size.value == null) {
        return
      }
      const [width, height] = this.size.value
      const { instanceData, root } = this.group
      const { array } = instanceData
      const bufferIndex = index * 16 + 13
      array[bufferIndex] = width
      array[bufferIndex + 1] = height
      instanceData.addUpdateRange(bufferIndex, 2)
      instanceData.needsUpdate = true
      root.requestRender()
    }, this.abortController.signal)
    abortableEffect(() => {
      const index = this.getIndexInBuffer()
      if (index == null || this.borderInset.value == null) {
        return
      }
      const { instanceData, root } = this.group
      const offset = index * 16 + 0
      instanceData.array.set(this.borderInset.value, offset)
      instanceData.addUpdateRange(offset, 4)
      instanceData.needsUpdate = true
      root.requestRender()
    }, this.abortController.signal),
      abortableEffect(() => {
        const index = this.getIndexInBuffer()
        if (index == null) {
          return
        }
        const { instanceClipping, root } = this.group
        const offset = index * 16
        const clipping = this.clippingRect?.value
        if (clipping != null) {
          clipping.toArray(instanceClipping.array, offset)
        } else {
          instanceClipping.array.set(defaultClippingData, offset)
        }
        instanceClipping.addUpdateRange(offset, 16)
        instanceClipping.needsUpdate = true
        root.requestRender()
      }, this.abortController.signal)
  }

  private requestShow(): void {
    if (this.insertedIntoGroup) {
      return
    }
    this.insertedIntoGroup = true
    this.group.insert(this.minorIndex, this)
  }

  private hide(): void {
    if (!this.insertedIntoGroup) {
      return
    }
    this.active.value = false
    this.group.delete(this.minorIndex, this.indexInBucket, this)
    this.insertedIntoGroup = false
    this.bucket = undefined
    this.indexInBucket = undefined
    this.abortController?.abort()
    this.abortController = undefined
  }
}
