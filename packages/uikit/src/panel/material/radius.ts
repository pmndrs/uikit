import { clamp } from 'three/src/math/MathUtils.js'
import { toAbsoluteNumber } from '../../text/utils.js'

export function resolvePackedBorderRadius(value: number | string, height: number): number {
  if (height === 0) {
    return 0
  }
  return clamp(Math.ceil((toAbsoluteNumber(value, () => height) / height) * 100), 0, 49)
}

export function resolvePanelBorderRadius(value: number | string, height: number): number {
  return (resolvePackedBorderRadius(value, height) / 100) * height
}
