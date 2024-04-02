import { Signal, signal, effect } from '@preact/signals-core'
import { Matrix4, Vector2Tuple } from 'three'
import { Bucket } from '../allocation/sorted-buckets.js'
import { ClippingRect, defaultClippingData } from '../clipping.js'
import { Inset } from '../flex/node.js'
import { InstancedPanelGroup, PanelGroupManager, PanelGroupProperties } from './instanced-panel-group.js'
import { ColorRepresentation, Subscriptions, unsubscribeSubscriptions } from '../utils.js'
import { MergedProperties } from '../properties/merged.js'
import { setupImmediateProperties } from '../properties/immediate.js'
import { OrderInfo } from '../order.js'
import { PanelMaterialConfig } from './index.js'

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

export function createInstancedPanel(
  propertiesSignal: Signal<MergedProperties>,
  orderInfo: Signal<OrderInfo>,
  panelGroupDependencies: Signal<PanelGroupProperties> | undefined,
  panelGroupManager: PanelGroupManager,
  matrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple>,
  offset: Signal<Vector2Tuple> | undefined,
  borderInset: Signal<Inset>,
  clippingRect: Signal<ClippingRect | undefined> | undefined,
  isHidden: Signal<boolean> | undefined,
  materialConfig: PanelMaterialConfig,
  subscriptions: Subscriptions,
) {
  subscriptions.push(
    effect(() => {
      const innerSubscriptions: Subscriptions = []
      const group = panelGroupManager.getGroup(orderInfo.value.majorIndex, panelGroupDependencies?.value)
      new InstancedPanel(
        propertiesSignal,
        group,
        orderInfo.value.minorIndex,
        matrix,
        size,
        offset,
        borderInset,
        clippingRect,
        isHidden,
        materialConfig,
        innerSubscriptions,
      )
      return () => unsubscribeSubscriptions(innerSubscriptions)
    }),
  )
}

const matrixHelper1 = new Matrix4()
const matrixHelper2 = new Matrix4()

export class InstancedPanel {
  private indexInBucket?: number
  private bucket?: Bucket<unknown>

  private unsubscribeList: Array<() => void> = []

  private insertedIntoGroup = false

  private active = signal<boolean>(false)

  constructor(
    propertiesSignal: Signal<MergedProperties>,
    private group: InstancedPanelGroup,
    private readonly minorIndex: number,
    private readonly matrix: Signal<Matrix4 | undefined>,
    private readonly size: Signal<Vector2Tuple>,
    private readonly offset: Signal<Vector2Tuple> | undefined,
    private readonly borderInset: Signal<Inset>,
    private readonly clippingRect: Signal<ClippingRect | undefined> | undefined,
    isHidden: Signal<boolean> | undefined,
    public readonly materialConfig: PanelMaterialConfig,
    subscriptions: Subscriptions,
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
        const { instanceData, instanceDataOnUpdate: instanceDataAddUpdateRange } = this.group
        setters[key](instanceData.array, instanceData.itemSize * index, value, size, instanceDataAddUpdateRange)
      },
      subscriptions,
    )
    const isVisible = materialConfig.computedIsVisibile(propertiesSignal, borderInset, size, isHidden)
    subscriptions.push(
      effect(() => {
        if (isVisible.value) {
          this.requestShow()
          return
        }
        this.hide()
      }),
      () => this.hide(),
    )
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
    this.unsubscribeList.push(
      effect(() => {
        const matrix = this.matrix.value
        if (matrix == null) {
          return
        }
        const { instanceMatrix, pixelSize } = this.group
        const index = this.getIndexInBuffer()
        if (index == null) {
          return
        }
        const arrayIndex = index * 16
        const [width, height] = this.size.value
        matrixHelper1.makeScale(width * pixelSize, height * pixelSize, 1)
        if (this.offset != null) {
          const [x, y] = this.offset.value
          matrixHelper1.premultiply(matrixHelper2.makeTranslation(x * pixelSize, y * pixelSize, 0))
        }
        matrixHelper1.premultiply(matrix)
        matrixHelper1.toArray(instanceMatrix.array, arrayIndex)
        instanceMatrix.addUpdateRange(arrayIndex, 16)
        instanceMatrix.needsUpdate = true
      }),
      effect(() => {
        const [width, height] = this.size.value
        const { instanceData } = this.group
        const { array } = instanceData
        const index = this.getIndexInBuffer()
        if (index == null) {
          return
        }
        const bufferIndex = index * 16 + 13
        array[bufferIndex] = width
        array[bufferIndex + 1] = height
        instanceData.addUpdateRange(bufferIndex, 2)
        instanceData.needsUpdate = true
      }),
      effect(() => {
        const { instanceData } = this.group
        const index = this.getIndexInBuffer()
        if (index == null) {
          return
        }
        const offset = index * 16 + 0
        instanceData.array.set(this.borderInset.value, offset)
        instanceData.addUpdateRange(offset, 4)
        instanceData.needsUpdate = true
      }),
      effect(() => {
        const { instanceClipping } = this.group
        const index = this.getIndexInBuffer()
        if (index == null) {
          return
        }
        const offset = index * 16
        const clipping = this.clippingRect?.value
        if (clipping != null) {
          clipping.toArray(instanceClipping.array, offset)
        } else {
          instanceClipping.array.set(defaultClippingData, offset)
        }
        instanceClipping.addUpdateRange(offset, 16)
        instanceClipping.needsUpdate = true
      }),
    )
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
    const unsubscribeListLength = this.unsubscribeList.length
    for (let i = 0; i < unsubscribeListLength; i++) {
      this.unsubscribeList[i]()
    }
    this.unsubscribeList.length = 0
  }
}
