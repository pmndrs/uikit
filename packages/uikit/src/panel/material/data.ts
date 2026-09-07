import { Signal } from '@preact/signals-core'
import { TypedArray, Vector2Tuple } from 'three'
import type { ColorRepresentation } from '../../utils.js'
import { toAbsoluteNumber } from '../../text/utils.js'
import { writeColor } from './color.js'
import type { NumberOrPercentageValue } from '../../properties/values.js'
import { resolvePackedBorderRadius } from './radius.js'

export const materialSetters = {
  // 0-3 = border sizes
  // 4-7 = background color
  backgroundColor: (d, o, p: ColorRepresentation, _, op, u) =>
    writeColor(
      d,
      o + 4,
      p,
      toAbsoluteNumber(op.value, () => 1),
      u,
    ),

  // 8 = border radiuses
  borderBottomLeftRadius: (d, o, p: number | string, { value: s }, _, u) => {
    s != null && writeBorderRadius(d, o + 8, 0, p, s[1], u)
  },
  borderBottomRightRadius: (d, o, p: number | string, { value: s }, _, u) =>
    s != null && writeBorderRadius(d, o + 8, 1, p, s[1], u),
  borderTopRightRadius: (d, o, p: number | string, { value: s }, _, u) =>
    s != null && writeBorderRadius(d, o + 8, 2, p, s[1], u),
  borderTopLeftRadius: (d, o, p: number | string, { value: s }, _, u) =>
    s != null && writeBorderRadius(d, o + 8, 3, p, s[1], u),

  // 9-12 = border color
  borderColor: (d, o, p: ColorRepresentation, _, op, u) =>
    writeColor(
      d,
      o + 9,
      p,
      toAbsoluteNumber(op.value, () => 1),
      u,
    ),

  // 13 = border bend
  borderBend: (d, o, p: NumberOrPercentageValue, _, op, u) =>
    writeComponent(
      d,
      o + 13,
      toAbsoluteNumber(p, () => 1),
      u,
    ),

  // 14 = width
  // 15 = height
} as const satisfies {
  [Key in string]: (
    data: TypedArray,
    offset: number,
    value: any,
    size: Signal<Vector2Tuple | undefined>,
    opacity: Signal<NumberOrPercentageValue>,
    onUpdate: ((start: number, count: number) => void) | undefined,
  ) => void
}

function writeBorderRadius(
  data: TypedArray,
  offset: number,
  indexInFloat: number,
  value: number | string,
  height: number,
  onUpdate: ((start: number, count: number) => void) | undefined,
): void {
  setBorderRadius(data, offset, indexInFloat, value, height)
  onUpdate?.(offset, 1)
}

function writeComponent(
  data: TypedArray,
  offset: number,
  value: any,
  onUpdate: ((start: number, count: number) => void) | undefined,
): void {
  data[offset] = value
  onUpdate?.(offset, 1)
}

function setComponentInFloat(from: number, index: number, value: number): number {
  const x = Math.pow(50, index)
  const currentValue = Math.floor(from / x) % 50
  return from + (value - currentValue) * x
}

function setBorderRadius(
  data: TypedArray,
  indexInData: number,
  indexInFloat: number,
  value: number | string,
  height: number,
) {
  data[indexInData] = setComponentInFloat(data[indexInData]!, indexInFloat, resolvePackedBorderRadius(value, height))
}
