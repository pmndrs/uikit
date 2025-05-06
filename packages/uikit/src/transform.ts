import { Signal, computed } from '@preact/signals-core'
import { Euler, Matrix4, Object3D, Quaternion, Vector2Tuple, Vector3, Vector3Tuple } from 'three'
import { FlexNodeState } from './flex/node.js'
import { abortableEffect, alignmentXMap, alignmentYMap, percentageRegex } from './utils.js'
import { Properties } from './properties/index.js'
import { RootContext } from './components/index.js'

export type Percentage = `${number}%`

export type TransformProperties = {
  transformTranslateX?: Percentage | number
  transformTranslateY?: Percentage | number
  transformTranslateZ?: number

  transformRotateX?: number
  transformRotateY?: number
  transformRotateZ?: number

  transformScaleX?: Percentage | number
  transformScaleY?: Percentage | number
  transformScaleZ?: Percentage | number

  transformOriginX?: keyof typeof alignmentXMap
  transformOriginY?: keyof typeof alignmentYMap
}

const tHelper = new Vector3()
const sHelper = new Vector3()
const originVector = new Vector3()
const matrixHelper = new Matrix4()
const eulerHelper = new Euler()
const quaternionHelper = new Quaternion()
const toRad = Math.PI / 180

function toQuaternion([x, y, z]: Vector3Tuple): Quaternion {
  return quaternionHelper.setFromEuler(eulerHelper.set(x * toRad, y * toRad, z * toRad))
}

const defaultTransformOriginX: keyof typeof alignmentXMap = 'center'
const defaultTransformOriginY: keyof typeof alignmentYMap = 'center'

export function computedTransformMatrix(
  properties: Properties,
  { relativeCenter, size }: FlexNodeState,
): Signal<Matrix4 | undefined> {
  //B * O^-1 * T * O
  //B = bound transformation matrix
  //O = matrix to transform the origin for matrix T
  //T = transform matrix (translate, rotate, scale)

  return computed(() => {
    if (relativeCenter.value == null) {
      return undefined
    }
    const [x, y] = relativeCenter.value
    const pixelSize = properties.get('pixelSize')
    const result = new Matrix4().makeTranslation(x * pixelSize, y * pixelSize, 0)

    let originCenter = true

    const tOX = properties.get('transformOriginX') ?? defaultTransformOriginX
    const tOY = properties.get('transformOriginY') ?? defaultTransformOriginY

    if (tOX != 'center' || tOY != 'center') {
      if (size.value == null) {
        return undefined
      }
      const [width, height] = size.value
      originCenter = false
      originVector.set(-alignmentXMap[tOX] * width * pixelSize, -alignmentYMap[tOY] * height * pixelSize, 0)
      result.multiply(matrixHelper.makeTranslation(originVector))
      originVector.negate()
    }

    const tTX = properties.get('transformTranslateX') ?? 0
    const tTY = properties.get('transformTranslateY') ?? 0
    const tTZ = properties.get('transformTranslateZ') ?? 0
    const tRX = properties.get('transformRotateX') ?? 0
    const tRY = properties.get('transformRotateY') ?? 0
    const tRZ = properties.get('transformRotateZ') ?? 0
    const tSX = properties.get('transformScaleX') ?? 1
    const tSY = properties.get('transformScaleY') ?? 1
    const tSZ = properties.get('transformScaleZ') ?? 1

    const r: Vector3Tuple = [tRX, tRY, tRZ]
    const t: Vector3Tuple = [translateToNumber(tTX, size, 0), -translateToNumber(tTY, size, 1), tTZ]
    const s: Vector3Tuple = [scaleToNumber(tSX), scaleToNumber(tSY), scaleToNumber(tSZ)]
    if (t.some((v) => v != 0) || r.some((v) => v != 0) || s.some((v) => v != 1)) {
      result.multiply(
        matrixHelper.compose(tHelper.fromArray(t).multiplyScalar(pixelSize), toQuaternion(r), sHelper.fromArray(s)),
      )
    }

    if (!originCenter) {
      result.multiply(matrixHelper.makeTranslation(originVector))
    }

    return result
  })
}

function scaleToNumber(scale: number | Percentage) {
  if (typeof scale === 'number') {
    return scale
  }
  const result = percentageRegex.exec(scale)
  if (result == null) {
    throw new Error(`invalid value "${scale}", expected number of percentage`)
  }
  return parseFloat(result[1]!) / 100
}

function translateToNumber(translate: number | Percentage, size: Signal<Vector2Tuple | undefined>, sizeIndex: number) {
  if (typeof translate === 'number') {
    return translate
  }
  const result = percentageRegex.exec(translate)
  if (result == null) {
    throw new Error(`invalid value "${translate}", expected number of percentage`)
  }
  const sizeOnAxis = size.value?.[sizeIndex] ?? 0
  return (sizeOnAxis * parseFloat(result[1]!)) / 100
}
