export type NumericString = `${number}`
export type NumberLike = number | NumericString
export type Percentage = `${number}%`
export type PixelLength = `${number}px`
export type ViewportHeightLength = `${number}vh` | `${number}dvh` | `${number}svh` | `${number}lvh`
export type ViewportWidthLength = `${number}vw` | `${number}dvw` | `${number}svw` | `${number}lvw`
export type ViewportLength = ViewportHeightLength | ViewportWidthLength
export type NumberOrPixelLength = NumberLike | PixelLength
export type TransformLength = NumberOrPixelLength | Percentage | ViewportLength
export type TransformScale = NumberLike | Percentage

const numberStringPattern = String.raw`[+-]?(?:(?:\d+\.?\d*)|(?:\.\d+))(?:[eE][+-]?\d+)?`
const numericStringRegex = new RegExp(`^${numberStringPattern}$`)
const percentageRegex = new RegExp(`^${numberStringPattern}%$`)
const pixelLengthRegex = new RegExp(`^${numberStringPattern}px$`)
const viewportLengthRegex = new RegExp(`^${numberStringPattern}(vh|dvh|svh|lvh|vw|dvw|svw|lvw)$`)

export function isNumericString(value: unknown): value is NumericString {
  return typeof value === 'string' && numericStringRegex.test(value)
}

export function isPercentageString(value: unknown): value is Percentage {
  return typeof value === 'string' && percentageRegex.test(value)
}

export function isPixelLengthString(value: unknown): value is PixelLength {
  return typeof value === 'string' && pixelLengthRegex.test(value)
}

export function isViewportLengthString(value: unknown): value is ViewportLength {
  return typeof value === 'string' && viewportLengthRegex.test(value)
}

export function isViewportHeightLength(value: unknown): value is ViewportHeightLength {
  return isViewportLengthString(value) && value.endsWith('vh')
}

export function isViewportWidthLength(value: unknown): value is ViewportWidthLength {
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
  if (isNumericString(value)) {
    return Number(value)
  }
  if (isPixelLengthString(value)) {
    return Number(value.slice(0, -2))
  }
  throw new Error(`Invalid number: ${value}`)
}

export function parseNumberLike(value: NumberLike): number {
  return typeof value === 'number' ? value : Number(value)
}

export function parseNumberOrPixelLength(value: NumberOrPixelLength): number {
  return isPixelLengthString(value) ? Number(value.slice(0, -2)) : parseNumberLike(value)
}

export function convertYogaPoint(
  input: TransformLength | undefined,
  viewportWidth: number,
  viewportHeight: number,
): Percentage | number | undefined {
  if (input == null || typeof input === 'number' || isPercentageString(input)) {
    return input
  }
  if (isNumericString(input)) {
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
