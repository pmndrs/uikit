import { Color, TypedArray } from 'three'
import type { ColorRepresentation } from '../../utils.js'

const colorHelper = new Color()

const rgbaRegex = /rgba\((\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\)/

export function writeColor(
  target: Array<number> | TypedArray,
  offset: number,
  color: ColorRepresentation,
  opacity: number,
  onUpdate?: ((start: number, count: number) => void) | undefined,
) {
  let match: RegExpMatchArray | null
  if (Array.isArray(color)) {
    for (let i = 0; i < color.length; i++) {
      target[i + offset] = color[i]!
    }
    target[offset + 3] = (color.length === 3 ? 1 : target[offset + 3]!) * opacity
  } else if (color === 'transparent') {
    target.fill(0, offset, offset + 4)
  } else if (typeof color === 'string' && (match = color.match(rgbaRegex)) != null) {
    for (let i = 0; i < 3; i++) {
      target[i + offset] = parseFloat(match[i + 1]!) / 255
    }
    target[3 + offset] = parseFloat(match[4]!) * opacity
  } else {
    colorHelper.set(color).toArray(target, offset)
    target[offset + 3] = opacity
  }
  onUpdate?.(offset, 4)
}
