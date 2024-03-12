import { Signal, computed } from '@preact/signals-core'
import { Euler, Matrix4, Quaternion, Vector3, Vector3Tuple } from 'three'
import { FlexNode } from './flex/node.js'
import { alignmentXMap, alignmentYMap } from './utils.js'
import { createGetBatchedProperties } from './properties/batched.js'
import { MergedProperties } from './properties/merged.js'

export type TransformProperties = {
  transformTranslateX?: number
  transformTranslateY?: number
  transformTranslateZ?: number

  transformRotateX?: number
  transformRotateY?: number
  transformRotateZ?: number

  transformScaleX?: number
  transformScaleY?: number
  transformScaleZ?: number

  transformOriginX?: keyof typeof alignmentXMap
  transformOriginY?: keyof typeof alignmentYMap
}

const tX = 'transformTranslateX'
const tY = 'transformTranslateY'
const tZ = 'transformTranslateZ'

const rX = 'transformRotateX'
const rY = 'transformRotateY'
const rZ = 'transformRotateZ'

const sX = 'transformScaleX'
const sY = 'transformScaleY'
const sZ = 'transformScaleZ'

const propertyKeys = [tX, tY, tZ, rX, rY, rZ, sX, sY, sZ]

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

export function computeTransformMatrix(
  propertiesSignal: Signal<MergedProperties>,
  node: FlexNode,
  renameOutput?: Record<string, string>,
): Signal<Matrix4 | undefined> {
  //B * O^-1 * T * O
  //B = bound transformation matrix
  //O = matrix to transform the origin for matrix T
  //T = transform matrix (translate, rotate, scale)
  const get = createGetBatchedProperties(propertiesSignal, propertyKeys, renameOutput)
  return computed(() => {
    const { pixelSize, relativeCenter } = node
    const [x, y] = relativeCenter.value
    const result = new Matrix4().makeTranslation(x * pixelSize, y * pixelSize, 0)

    const tOriginX = (get('transformOriginX') ?? 'center') as keyof typeof alignmentXMap
    const tOriginY = (get('transformOriginY') ?? 'center') as keyof typeof alignmentYMap
    let originCenter = true

    if (tOriginX != 'center' || tOriginY != 'center') {
      const [width, height] = node.size.value
      originCenter = false
      originVector.set(-alignmentXMap[tOriginX] * width * pixelSize, -alignmentYMap[tOriginY] * height * pixelSize, 0)
      result.multiply(matrixHelper.makeTranslation(originVector))
      originVector.negate()
    }

    const r: Vector3Tuple = [(get(rX) as number) ?? 0, (get(rY) as number) ?? 0, (get(rZ) as number) ?? 0]
    const t: Vector3Tuple = [(get(tX) as number) ?? 0, -((get(tY) as number) ?? 0), (get(tZ) as number) ?? 0]
    const s: Vector3Tuple = [(get(sX) as number) ?? 1, (get(sY) as number) ?? 1, (get(sZ) as number) ?? 1]
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
