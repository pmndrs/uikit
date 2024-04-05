import { BufferAttribute, PlaneGeometry, TypedArray } from 'three'
import { clamp } from 'three/src/math/MathUtils.js'

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

export function setBorderRadius(
  data: TypedArray,
  indexInData: number,
  indexInFloat: number,
  value: number,
  height: number,
) {
  data[indexInData] = setComponentInFloat(
    data[indexInData],
    indexInFloat,
    clamp(Math.ceil(((value ?? 0) / height) * 100), 0, 49),
  )
}
