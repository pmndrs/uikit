import { Signal, computed } from '@preact/signals-core'
import { RenderItem } from 'three'
import { MergedProperties } from './properties/merged.js'
import { computedInheritableProperty } from './properties/index.js'
import { readReactive } from './utils.js'

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
  const aDistanceRef = (a.object as any)[reversePainterSortStableCacheKey] as
    | WithReversePainterSortStableCache
    | undefined
  const bDistanceRef = (b.object as any)[reversePainterSortStableCacheKey] as
    | WithReversePainterSortStableCache
    | undefined
  if (aDistanceRef != null) {
    aDistanceRef.reversePainterSortStableCache ??= az
    az = aDistanceRef.reversePainterSortStableCache
  }
  if (bDistanceRef != null) {
    bDistanceRef.reversePainterSortStableCache ??= bz
    bz = bDistanceRef.reversePainterSortStableCache
  }
  if (aDistanceRef != null && aDistanceRef === bDistanceRef) {
    return compareOrderInfo((a.object as any)[orderInfoKey].value, (b.object as any)[orderInfoKey].value)
  }
  //default z comparison
  return az !== bz ? bz - az : a.id - b.id
}

//the following order tries to represent the most common element order of the respective element types (e.g. panels are most likely the background element)
export const ElementType = {
  Panel: 0, //render first
  Image: 1,
  Object: 2,
  Custom: 3,
  Svg: 4,
  Text: 5, //render last
} as const

export type ElementType = (typeof ElementType)[keyof typeof ElementType]

export type OrderInfo = {
  majorIndex: number
  elementType: ElementType
  minorIndex: number
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
  dif = o1.elementType - o2.elementType
  if (dif != 0) {
    return dif
  }
  return o1.minorIndex - o2.minorIndex
}

export type ZIndexProperties = {
  zIndexOffset?: ZIndexOffset
}

export type ZIndexOffset = { major?: number; minor?: number } | number

export function computedOrderInfo(
  propertiesSignal: Signal<MergedProperties> | undefined,
  zIndexOffsetKey: string,
  type: ElementType,
  instancedGroupDependencies: Signal<Record<string, any>> | Record<string, any> | undefined,
  parentOrderInfoSignal: Signal<OrderInfo | undefined> | undefined,
): Signal<OrderInfo | undefined> {
  const zIndexOffset =
    propertiesSignal == null
      ? undefined
      : computedInheritableProperty<ZIndexOffset | undefined>(propertiesSignal, zIndexOffsetKey, undefined)
  return computed(() => {
    let parentOrderInfo: OrderInfo | undefined
    if (parentOrderInfoSignal == null) {
      parentOrderInfo = undefined
    } else if (parentOrderInfoSignal.value == null) {
      return undefined
    } else {
      parentOrderInfo = parentOrderInfoSignal.value
    }

    const offset = zIndexOffset?.value

    const majorOffset = typeof offset === 'number' ? offset : (offset?.major ?? 0)
    const minorOffset = typeof offset === 'number' ? 0 : (offset?.minor ?? 0)

    let majorIndex: number
    let minorIndex: number

    if (parentOrderInfo == null) {
      majorIndex = 0
      minorIndex = 0
    } else if (type > parentOrderInfo.elementType) {
      majorIndex = parentOrderInfo.majorIndex
      minorIndex = 0
    } else if (
      type != parentOrderInfo.elementType ||
      !shallowEqualRecord(
        readReactive(instancedGroupDependencies),
        readReactive(parentOrderInfo.instancedGroupDependencies),
      )
    ) {
      majorIndex = parentOrderInfo.majorIndex + 1
      minorIndex = 0
    } else {
      majorIndex = parentOrderInfo.majorIndex
      minorIndex = parentOrderInfo.minorIndex + 1
    }

    if (majorOffset > 0) {
      majorIndex += majorOffset
      minorIndex = 0
    }

    minorIndex += minorOffset

    return {
      instancedGroupDependencies,
      elementType: type,
      majorIndex,
      minorIndex,
    }
  })
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

export function setupRenderOrder<T>(
  result: T,
  rootCameraDistance: WithReversePainterSortStableCache,
  orderInfo: { value: OrderInfo | undefined },
): T {
  ;(result as any)[reversePainterSortStableCacheKey] = rootCameraDistance
  ;(result as any)[orderInfoKey] = orderInfo
  return result
}
