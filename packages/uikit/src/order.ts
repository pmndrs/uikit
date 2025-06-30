import { Signal } from '@preact/signals-core'
import { Object3D, RenderItem } from 'three'
import { abortableEffect, readReactive } from './utils.js'
import { Properties } from './properties/index.js'

export type WithReversePainterSortStableCache = { reversePainterSortStableCache?: number }

export const reversePainterSortStableCacheKey = Symbol('reverse-painter-sort-stable-cache-key')
export const orderInfoKey = Symbol('order-info-key')

export function reversePainterSortStable(a: RenderItem, b: RenderItem) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder
  }
  if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder
  }
  let az = a.z
  let bz = b.z
  const aRootSignal = (a.object as any)[reversePainterSortStableCacheKey] as
    | { peek(): WithReversePainterSortStableCache }
    | undefined
  const bRootSignal = (b.object as any)[reversePainterSortStableCacheKey] as
    | { peek(): WithReversePainterSortStableCache }
    | undefined
  if (aRootSignal != null) {
    const root = aRootSignal.peek()
    root.reversePainterSortStableCache ??= az
    az = root.reversePainterSortStableCache
  }
  if (bRootSignal != null) {
    const root = bRootSignal.peek()
    root.reversePainterSortStableCache ??= bz
    bz = root.reversePainterSortStableCache
  }
  if (aRootSignal != null && aRootSignal.peek() === bRootSignal?.peek()) {
    return compareOrderInfo((a.object as any)[orderInfoKey].value, (b.object as any)[orderInfoKey].value)
  }
  //default z comparison
  return az !== bz ? bz - az : a.id - b.id
}

//the following order tries to represent the most common element order of the respective element types (e.g. panels are most likely the background element)
export const ElementType = {
  Panel: 0, //render first
  Image: 1,
  Content: 2,
  Custom: 3,
  Text: 4, //render last
} as const

export type ElementType = (typeof ElementType)[keyof typeof ElementType]

export type OrderInfo = {
  majorIndex: number
  minorIndex: number
  elementType: ElementType
  patchIndex: number
  instancedGroupDependencies?: Signal<Record<string, any>> | Record<string, any>
}

export function compareOrderInfo(o1: OrderInfo | undefined, o2: OrderInfo | undefined): number {
  if (o1 == null || o2 == null) {
    return 0
  }
  let dif = o1.majorIndex - o2.majorIndex
  if (dif != 0) {
    return dif
  }
  dif = o1.minorIndex - o2.minorIndex
  if (dif != 0) {
    return dif
  }
  dif = o1.elementType - o2.elementType
  if (dif != 0) {
    return dif
  }
  return o1.patchIndex - o2.patchIndex
}

export type ZIndexProperties = {
  zIndex?: number
  zIndexOffset?: number
}

export function setupOrderInfo(
  target: Signal<OrderInfo | undefined>,
  properties: Properties,
  zIndexKey: string,
  type: ElementType,
  instancedGroupDependencies: Signal<Record<string, any>> | Record<string, any> | undefined,
  basisOrderInfoSignal: Signal<OrderInfo | undefined | null>,
  abortSignal: AbortSignal,
): void {
  abortableEffect(() => {
    if (basisOrderInfoSignal.value === undefined) {
      target.value = undefined
      return
    }

    const basisOrderInfo = basisOrderInfoSignal.value
    //similiar but not the same as in css
    const majorIndex = properties.value[zIndexKey as 'zIndex'] ?? basisOrderInfo?.majorIndex ?? 0

    let minorIndex: number
    let patchIndex: number

    if (basisOrderInfo == null) {
      minorIndex = 0
      patchIndex = 0
    } else if (type > basisOrderInfo.elementType) {
      minorIndex = basisOrderInfo.minorIndex
      patchIndex = 0
    } else if (
      type != basisOrderInfo.elementType ||
      !shallowEqualRecord(
        readReactive(instancedGroupDependencies),
        readReactive(basisOrderInfo.instancedGroupDependencies),
      )
    ) {
      minorIndex = basisOrderInfo.minorIndex + 1
      patchIndex = 0
    } else {
      minorIndex = basisOrderInfo.minorIndex
      patchIndex = basisOrderInfo.patchIndex + 1
    }

    patchIndex += properties.value['zIndexOffset'] ?? 0

    target.value = {
      instancedGroupDependencies,
      elementType: type,
      majorIndex,
      minorIndex,
      patchIndex,
    }
  }, abortSignal)
}

function shallowEqualRecord(r1: Record<string, any> | undefined, r2: Record<string, any> | undefined): boolean {
  if (r1 === r2) {
    return true
  }
  if (r1 == null || r2 == null) {
    return false
  }
  //i counts the number of keys in r1
  let i = 0
  for (const key in r1) {
    if (r1[key] != r2[key]) {
      return false
    }
    ++i
  }
  return i === Object.keys(r2).length
}

export function setupRenderOrder(
  target: Object3D,
  root: { peek(): WithReversePainterSortStableCache },
  orderInfo: { value: OrderInfo | undefined },
) {
  ;(target as any)[reversePainterSortStableCacheKey] = root
  ;(target as any)[orderInfoKey] = orderInfo
}
