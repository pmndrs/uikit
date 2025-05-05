import { Signal, computed, effect } from '@preact/signals-core'
import { Euler, Matrix4, Object3D, Quaternion, Vector2Tuple, Vector3, Vector3Tuple } from 'three'
import { FlexNodeState } from './flex/node.js'
import { abortableEffect, alignmentXMap, alignmentYMap, percentageRegex } from './utils.js'
import { MergedProperties } from './properties/merged.js'
import { RootContext } from './context.js'
import { computedInheritableProperty } from './properties/index.js'

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
  propertiesSignal: Signal<MergedProperties>,
  { relativeCenter, size }: FlexNodeState,
  pixelSizeSignal: Signal<number>,
): Signal<Matrix4 | undefined> {
  //B * O^-1 * T * O
  //B = bound transformation matrix
  //O = matrix to transform the origin for matrix T
  //T = transform matrix (translate, rotate, scale)

  const tTX = computedInheritableProperty<Percentage | number>(propertiesSignal, 'transformTranslateX', 0)
  const tTY = computedInheritableProperty<Percentage | number>(propertiesSignal, 'transformTranslateY', 0)
  const tTZ = computedInheritableProperty(propertiesSignal, 'transformTranslateZ', 0)
  const tRX = computedInheritableProperty(propertiesSignal, 'transformRotateX', 0)
  const tRY = computedInheritableProperty(propertiesSignal, 'transformRotateY', 0)
  const tRZ = computedInheritableProperty(propertiesSignal, 'transformRotateZ', 0)
  const tSX = computedInheritableProperty<Percentage | number>(propertiesSignal, 'transformScaleX', 1)
  const tSY = computedInheritableProperty<Percentage | number>(propertiesSignal, 'transformScaleY', 1)
  const tSZ = computedInheritableProperty<Percentage | number>(propertiesSignal, 'transformScaleZ', 1)
  const tOX = computedInheritableProperty(propertiesSignal, 'transformOriginX', defaultTransformOriginX)
  const tOY = computedInheritableProperty(propertiesSignal, 'transformOriginY', defaultTransformOriginY)

  return computed(() => {
    if (relativeCenter.value == null) {
      return undefined
    }
    const [x, y] = relativeCenter.value
    const pixelSize = pixelSizeSignal.value
    const result = new Matrix4().makeTranslation(x * pixelSize, y * pixelSize, 0)

    let originCenter = true

    if (tOX.value != 'center' || tOY.value != 'center') {
      if (size.value == null) {
        return undefined
      }
      const [width, height] = size.value
      originCenter = false
      originVector.set(-alignmentXMap[tOX.value] * width * pixelSize, -alignmentYMap[tOY.value] * height * pixelSize, 0)
      result.multiply(matrixHelper.makeTranslation(originVector))
      originVector.negate()
    }

    const r: Vector3Tuple = [tRX.value, tRY.value, tRZ.value]
    const t: Vector3Tuple = [translateToNumber(tTX.value, size, 0), -translateToNumber(tTY.value, size, 1), tTZ.value]
    const s: Vector3Tuple = [scaleToNumber(tSX.value), scaleToNumber(tSY.value), scaleToNumber(tSZ.value)]
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
  return parseFloat(result[1]) / 100
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
  return (sizeOnAxis * parseFloat(result[1])) / 100
}

export function setupObjectTransform(
  root: Pick<RootContext, 'requestRender'>,
  object: Object3D,
  transformMatrix: Signal<Matrix4 | undefined>,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    if (transformMatrix.value == null) {
      object.matrix.elements.fill(0)
      return
    }
    object.matrix.copy(transformMatrix.value)
    root.requestRender()
  }, abortSignal)
}
