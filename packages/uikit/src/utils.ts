import { computed, effect, Signal } from '@preact/signals-core'
import { Vector2Tuple, Color, Vector3Tuple, Vector3 } from 'three'
import { Inset } from './flex/node.js'
import { MergedProperties } from './properties/merged.js'
import { computedInheritableProperty } from './properties/index.js'

export const percentageRegex = /(-?\d+(?:\.\d+)?)%/

export type ColorRepresentation = Color | string | number | Vector3Tuple

export function abortableEffect(fn: Parameters<typeof effect>[0], abortSignal: AbortSignal): void {
  if (abortSignal.aborted) {
    return
  }
  const unsubscribe = effect(fn)
  abortSignal.addEventListener('abort', unsubscribe)
}

export const alignmentXMap = { left: 0.5, center: 0, middle: 0, right: -0.5 }
export const alignmentYMap = { top: -0.5, center: 0, middle: 0, bottom: 0.5 }
export const alignmentZMap = { back: -0.5, center: 0, middle: 0, front: 0.5 }

/**
 * calculates the offsetX, offsetY, and scale to fit content with size [aspectRatio, 1] inside
 */
export function fitNormalizedContentInside(
  offsetTarget: Vector3,
  scaleTarget: Vector3,
  size: Signal<Vector2Tuple | undefined>,
  paddingInset: Signal<Inset | undefined>,
  borderInset: Signal<Inset | undefined>,
  pixelSize: number,
  aspectRatio: number,
): void {
  if (size.value == null || paddingInset.value == null || borderInset.value == null) {
    return
  }
  const [width, height] = size.value
  const [pTop, pRight, pBottom, pLeft] = paddingInset.value
  const [bTop, bRight, bBottom, bLeft] = borderInset.value
  const topInset = pTop + bTop
  const rightInset = pRight + bRight
  const bottomInset = pBottom + bBottom
  const leftInset = pLeft + bLeft
  offsetTarget.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0)

  const innerWidth = width - leftInset - rightInset
  const innerHeight = height - topInset - bottomInset
  const flexRatio = innerWidth / innerHeight
  if (flexRatio > aspectRatio) {
    scaleTarget.setScalar(innerHeight * pixelSize)
    return
  }
  scaleTarget.setScalar((innerWidth * pixelSize) / aspectRatio)
}

export function readReactive<T>(value: T | Signal<T>): T {
  return value instanceof Signal ? value.value : value
}

export function createConditionalPropertyTranslator(condition: () => boolean) {
  const signalMap = new Map<unknown, Signal<unknown>>()
  return (properties: unknown, merged: MergedProperties) => {
    if (typeof properties != 'object') {
      throw new Error(`Invalid properties "${properties}"`)
    }
    for (const key in properties) {
      const value = properties[key as never]
      if (value === undefined) {
        return
      }
      let result = signalMap.get(value)
      if (result == null) {
        signalMap.set(value, (result = computed(() => (condition() ? readReactive(value) : undefined))))
      }
      merged.add(key, result)
    }
  }
}

export function computedBorderInset(
  propertiesSignal: Signal<MergedProperties>,
  keys: ReadonlyArray<string>,
): Signal<Inset> {
  const sizes = keys.map((key) => computedInheritableProperty(propertiesSignal, key, 0))
  return computed(() => sizes.map((size) => size.value) as Inset)
}
