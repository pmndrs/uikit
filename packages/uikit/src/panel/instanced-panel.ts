import { computed, Signal, signal } from '@preact/signals-core'
import { Matrix4, Vector2Tuple } from 'three'
import { Bucket } from '../allocation/sorted-buckets.js'
import { ClippingRect, defaultClippingData } from '../clipping.js'
import { Inset } from '../flex/node.js'
import { InstancedPanelGroup, PanelGroupProperties } from './instanced-panel-group.js'
import { abortableEffect, ColorRepresentation } from '../utils.js'
import { OrderInfo } from '../order.js'
import { PanelMaterialConfig } from './panel-material.js'
import { BaseOutProperties, Properties } from '../properties/index.js'
import { RootContext } from '../context.js'

export type PanelProperties = {
  borderTopLeftRadius?: number | string
  borderTopRightRadius?: number | string
  borderBottomLeftRadius?: number | string
  borderBottomRightRadius?: number | string
  opacity?: number | `${number}%`
  backgroundColor?: ColorRepresentation
  borderColor?: ColorRepresentation
  borderBend?: number | `${number}%`
}

export function setupInstancedPanel(
  properties: Properties,
  root: Signal<RootContext>,
  orderInfo: Signal<OrderInfo | undefined>,
  panelGroupDependencies: Signal<Required<PanelGroupProperties>>,
  panelMatrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
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
    const group = root.value.panelGroupManager.getGroup(orderInfo.value, panelGroupDependencies.value)
    new InstancedPanel(
      properties,
      group,
      orderInfo.value.patchIndex,
      panelMatrix,
      size,
      borderInset,
      clippingRect,
      isVisible,
      materialConfig,
      innerAbortController.signal,
    )
    return () => innerAbortController.abort()
  }, abortSignal)
}

const matrixHelper = new Matrix4()

export function computedPanelMatrix(
  properties: Properties,
  matrixSignal: Signal<Matrix4 | undefined>,
  sizeSignal: Signal<Vector2Tuple | undefined>,
  offsetSignal?: Signal<Vector2Tuple>,
) {
  return computed(() => {
    const size = sizeSignal.value
    const matrix = matrixSignal.value
    if (size == null || matrix == null) {
      return undefined
    }
    const [width, height] = size
    const pixelSize = properties.value.pixelSize
    const result = new Matrix4()
    result.makeScale(width * pixelSize, height * pixelSize, 1)
    if (offsetSignal != null) {
      const [x, y] = offsetSignal.value
      result.premultiply(matrixHelper.makeTranslation(x * pixelSize, y * pixelSize, 0))
    }
    return result.premultiply(matrix)
  })
}

export class InstancedPanel {
  private indexInBucket?: number
  private bucket?: Bucket<unknown>

  private insertedIntoGroup = false

  private active = signal<boolean>(false)
  private abortController?: AbortController

  constructor(
    properties: Properties,
    private readonly group: InstancedPanelGroup,
    private readonly minorIndex: number,
    private readonly matrix: Signal<Matrix4 | undefined>,
    private readonly size: Signal<Vector2Tuple | undefined>,
    private readonly borderInset: Signal<Inset | undefined>,
    private readonly clippingRect: Signal<ClippingRect | undefined> | undefined,
    isVisible: Signal<boolean>,
    public readonly materialConfig: PanelMaterialConfig,
    abortSignal: AbortSignal,
  ) {
    const setters = materialConfig.setters
    abortableEffect(() => {
      if (!isVisible.value || !this.active.value) {
        return
      }
      return properties.subscribePropertyKeys((key) => {
        if (!materialConfig.hasProperty(key as string)) {
          return
        }
        abortableEffect(() => {
          const index = this.getIndexInBuffer()
          if (index == null) {
            return
          }
          const { instanceData, instanceDataOnUpdate: instanceDataAddUpdateRange, root } = this.group
          setters[key as string]!(
            instanceData.array,
            instanceData.itemSize * index,
            properties.value[key as keyof BaseOutProperties],
            size,
            properties.signal.opacity,
            instanceDataAddUpdateRange,
          )
          root.requestRender?.()
        }, abortSignal)
      })
    }, abortSignal)
    const isPanelVisible = materialConfig.computedIsVisibile(properties, borderInset, size, isVisible)
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
      if (this.matrix.value == null) {
        return
      }
      const index = this.getIndexInBuffer()
      if (index == null) {
        return
      }
      const arrayIndex = index * 16
      const { instanceMatrix, root } = this.group
      this.matrix.value.toArray(instanceMatrix.array, arrayIndex)
      instanceMatrix.addUpdateRange(arrayIndex, 16)
      instanceMatrix.needsUpdate = true
      root.requestRender?.()
    }, this.abortController.signal)
    abortableEffect(() => {
      const index = this.getIndexInBuffer()
      if (index == null || this.size.value == null) {
        return
      }
      const [width, height] = this.size.value
      const { instanceData, root } = this.group
      const { array } = instanceData
      const bufferIndex = index * 16 + 14
      array[bufferIndex] = width
      array[bufferIndex + 1] = height
      instanceData.addUpdateRange(bufferIndex, 2)
      instanceData.needsUpdate = true
      root.requestRender?.()
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
      root.requestRender?.()
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
        root.requestRender?.()
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
