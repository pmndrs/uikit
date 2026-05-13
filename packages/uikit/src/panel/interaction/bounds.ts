import { Signal } from '@preact/signals-core'
import { Matrix4, Sphere, Vector2Tuple } from 'three'
import { abortableEffect } from '../../utils.js'

export function setupBoundingSphere(
  target: Sphere,
  pixelSize: Signal<number>,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    const sizeValue = size.value
    const globalMatrix = globalMatrixSignal.value
    if (sizeValue == null || globalMatrix == null) {
      return
    }
    target.center.set(0, 0, 0)
    const [w, h] = sizeValue
    const maxDiameter = Math.sqrt(w * w + h * h)
    target.radius = maxDiameter * 0.5 * pixelSize.value
    target.applyMatrix4(globalMatrix)
  }, abortSignal)
}
