import { Signal, computed } from '@preact/signals-core'
import { BufferAttribute, PlaneGeometry, TypedArray, Vector2Tuple } from 'three'
import { clamp } from 'three/src/math/MathUtils.js'
import { Inset } from '../flex/node.js'
import { createGetBatchedProperties } from '../properties/batched.js'
import { MergedProperties } from '../properties/merged.js'
import { ColorRepresentation } from '../utils.js'

export type Constructor<T> = new (...args: any[]) => T
export type FirstConstructorParameter<T extends new (...args: any[]) => any> = T extends new (
  property: infer P,
  ...args: any[]
) => any
  ? P
  : never

export function createPanelGeometry() {
  const geometry = new PlaneGeometry()
  const position = geometry.getAttribute('position')
  const array = new Float32Array(4 * position.count)
  const tangent = [1, 0, 0, 1]
  for (let i = 0; i < array.length; i++) {
    array[i] = tangent[i % 4]
  }
  geometry.setAttribute('tangent', new BufferAttribute(array, 4))
  return geometry
}

export function setComponentInFloat(from: number, index: number, value: number): number {
  const x = Math.pow(50, index)
  const currentValue = Math.floor(from / x) % 50
  return from + (value - currentValue) * x
}

export const panelGeometry = createPanelGeometry()

const visibleProperties = ['borderOpacity', 'backgroundColor', 'backgroundOpacity']

export function computeIsPanelVisible(
  propertiesSignal: Signal<MergedProperties>,
  borderInset: Signal<Inset>,
  size: Signal<Vector2Tuple>,
  isHidden: Signal<boolean> | undefined,
  defaultBackgroundColor?: ColorRepresentation,
) {
  const get = createGetBatchedProperties(propertiesSignal, visibleProperties)
  return computed(() => {
    const borderOpacity = get('borderOpacity') as number
    const backgroundOpacity = get('backgroundOpacity') as number
    const backgroundColor = defaultBackgroundColor ?? (get('backgroundColor') as ColorRepresentation)
    const borderVisible = borderInset.value.some((s) => s > 0) && (borderOpacity == null || borderOpacity > 0)
    const [width, height] = size.value
    const backgroundVisible =
      width > 0 && height > 0 && (backgroundOpacity == null || backgroundOpacity > 0) && backgroundColor != null

    if (!backgroundVisible && !borderVisible) {
      return false
    }

    if (isHidden == null) {
      return true
    }

    return !isHidden.value
  })
}

export function setBorderRadius(
  data: TypedArray,
  indexInData: number,
  indexInFloat: number,
  value: number | undefined,
  height: number,
) {
  data[indexInData] = setComponentInFloat(
    data[indexInData],
    indexInFloat,
    clamp(Math.ceil(((value ?? 0) / height) * 100), 0, 49),
  )
}
