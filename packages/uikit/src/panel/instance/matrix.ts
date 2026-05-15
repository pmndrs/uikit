import { computed, Signal } from '@preact/signals-core'
import { Matrix4, Vector2Tuple } from 'three'
import { Properties } from '../../properties/index.js'
import { parseNumberValue } from '../../properties/values.js'

const matrixHelper = new Matrix4()

export function computedPanelMatrix(
  properties: Properties,
  matrixSignal: Signal<Matrix4 | undefined>,
  sizeSignal: Signal<Vector2Tuple | undefined>,
  offsetSignal?: Signal<Vector2Tuple>,
) {
  return computed(() => {
    const size = sizeSignal.value
    const matrix = matrixSignal.value
    if (size == null || matrix == null) {
      return undefined
    }
    const [width, height] = size
    const pixelSize = parseNumberValue(properties.value.pixelSize)
    const result = new Matrix4()
    result.makeScale(width * pixelSize, height * pixelSize, 1)
    if (offsetSignal != null) {
      const [x, y] = offsetSignal.value
      result.premultiply(matrixHelper.makeTranslation(x * pixelSize, y * pixelSize, 0))
    }
    return result.premultiply(matrix)
  })
}
