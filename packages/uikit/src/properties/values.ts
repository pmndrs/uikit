export type NumericString = `${number}`
export type Percentage = `${number}%`
export type PixelLength = `${number}px`
export type ViewportHeightLength = `${number}vh` | `${number}dvh` | `${number}svh` | `${number}lvh`
export type ViewportWidthLength = `${number}vw` | `${number}dvw` | `${number}svw` | `${number}lvw`
export type ViewportLength = ViewportHeightLength | ViewportWidthLength
export type TransformLength = number | NumericString | PixelLength | Percentage | ViewportLength
export type TransformScale = number | Percentage

const numericStringRegex = /^-?\d+(\.\d+)?$/
const percentageRegex = /^-?\d+(\.\d+)?%$/
const pixelLengthRegex = /^-?\d+(\.\d+)?px$/
const viewportLengthRegex = /^-?\d+(\.\d+)?(vh|dvh|svh|lvh|vw|dvw|svw|lvw)$/

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
  if (isNumericString(value) || isPixelLengthString(value)) {
    return Number.parseFloat(value)
  }
  throw new Error(`Invalid number: ${value}`)
}

export function convertYogaPoint(
  input: Percentage | ViewportLength | number | undefined,
  viewportWidth: number,
  viewportHeight: number,
): Percentage | number | undefined {
  if (input == null || typeof input === 'number' || isPercentageString(input)) {
    return input
  }
  if (isViewportWidthLength(input)) {
    return (viewportWidth * Number.parseFloat(input)) / 100
  }
  if (isViewportHeightLength(input)) {
    return (viewportHeight * Number.parseFloat(input)) / 100
  }
  throw new Error(`Invalid Yoga point: ${input}`)
}
