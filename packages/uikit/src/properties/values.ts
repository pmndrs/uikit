export type NumberString = `${number}`
export type PercentageString = `${number}%`
export type PixelLengthString = `${number}px`
export type ViewportHeightLengthString = `${number}vh` | `${number}dvh` | `${number}svh` | `${number}lvh`
export type ViewportWidthLengthString = `${number}vw` | `${number}dvw` | `${number}svw` | `${number}lvw`
export type ViewportLengthString = ViewportHeightLengthString | ViewportWidthLengthString
export type NumberValue = number | NumberString
export type AbsoluteLengthValue = NumberValue | PixelLengthString
export type LengthValue = AbsoluteLengthValue | PercentageString | ViewportLengthString
export type NumberOrPercentageValue = NumberValue | PercentageString

const numberStringPattern = String.raw`[+-]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][+-]?\d+)?`
const numberStringRegex = new RegExp(`^${numberStringPattern}$`)
const percentageRegex = new RegExp(`^${numberStringPattern}%$`)
const pixelLengthRegex = new RegExp(`^${numberStringPattern}px$`)
const viewportLengthRegex = new RegExp(`^${numberStringPattern}(vh|dvh|svh|lvh|vw|dvw|svw|lvw)$`)

export function isNumberString(value: unknown): value is NumberString {
  return typeof value === 'string' && numberStringRegex.test(value)
}

export function isPercentageString(value: unknown): value is PercentageString {
  return typeof value === 'string' && percentageRegex.test(value)
}

export function isPixelLengthString(value: unknown): value is PixelLengthString {
  return typeof value === 'string' && pixelLengthRegex.test(value)
}

export function isViewportLengthString(value: unknown): value is ViewportLengthString {
  return typeof value === 'string' && viewportLengthRegex.test(value)
}

export function isViewportHeightLength(value: unknown): value is ViewportHeightLengthString {
  return isViewportLengthString(value) && value.endsWith('vh')
}

export function isViewportWidthLength(value: unknown): value is ViewportWidthLengthString {
  return isViewportLengthString(value) && value.endsWith('vw')
}

export function parseAbsoluteNumber(
  value: number | string,
  getRelativeValue?: () => number,
  viewportWidth?: number,
  viewportHeight?: number,
): number {
  if (typeof value === 'number') {
    return value
  }
  if (isPercentageString(value)) {
    const number = Number.parseFloat(value)
    return getRelativeValue == null ? number : (getRelativeValue() * number) / 100
  }
  if (isViewportHeightLength(value)) {
    const number = Number.parseFloat(value)
    return viewportHeight == null ? number : (viewportHeight * number) / 100
  }
  if (isViewportWidthLength(value)) {
    const number = Number.parseFloat(value)
    return viewportWidth == null ? number : (viewportWidth * number) / 100
  }
  if (isNumberString(value)) {
    return Number(value)
  }
  if (isPixelLengthString(value)) {
    return Number(value.slice(0, -2))
  }
  throw new Error(`Invalid number: ${value}`)
}

export function parseNumberValue(value: NumberValue): number {
  return typeof value === 'number' ? value : Number(value)
}

export function parseAbsoluteLengthValue(value: AbsoluteLengthValue): number {
  return isPixelLengthString(value) ? Number(value.slice(0, -2)) : parseNumberValue(value)
}

export function convertYogaPoint(
  input: LengthValue | undefined,
  viewportWidth: number,
  viewportHeight: number,
): PercentageString | number | undefined {
  if (input == null || typeof input === 'number' || isPercentageString(input)) {
    return input
  }
  if (isNumberString(input)) {
    return Number(input)
  }
  if (isPixelLengthString(input)) {
    return Number(input.slice(0, -2))
  }
  if (isViewportWidthLength(input)) {
    return (viewportWidth * Number.parseFloat(input)) / 100
  }
  if (isViewportHeightLength(input)) {
    return (viewportHeight * Number.parseFloat(input)) / 100
  }
  throw new Error(`Invalid Yoga point: ${input}`)
}
