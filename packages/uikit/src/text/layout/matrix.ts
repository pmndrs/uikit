import { computed } from '@preact/signals-core'
import type { ReadonlySignal } from '@preact/signals-core'
import { Matrix4, Quaternion, Vector3 } from 'three'
import type { Inset } from '../../flex/node.js'
import type { TextMatrixTarget } from './types.js'
import { parseNumberLike } from '../../properties/values.js'

const IdentityMatrix = new Matrix4()
const IdentityQuaternion = new Quaternion()
const IdentityScale = new Vector3(1, 1, 1)
const textMatrixPosition = new Vector3()

export function computedGlobalTextMatrix(target: TextMatrixTarget): ReadonlySignal<Matrix4 | undefined> {
  return computed(() => {
    const paddingInset = target.paddingInset.value
    const borderInset = target.borderInset.value
    if (paddingInset == null || borderInset == null) {
      return IdentityMatrix
    }
    return getGlobalTextMatrix(
      paddingInset,
      borderInset,
      parseNumberLike(target.properties.value.pixelSize),
      target.globalMatrix.value ?? IdentityMatrix,
    )
  })
}

export function getGlobalTextMatrix(
  paddingInset: Inset,
  borderInset: Inset,
  pixelSize: number,
  globalMatrix: Matrix4 = IdentityMatrix,
): Matrix4 {
  const [pTop, pRight, pBottom, pLeft] = paddingInset
  const [bTop, bRight, bBottom, bLeft] = borderInset

  const topInset = pTop + bTop
  const rightInset = pRight + bRight
  const bottomInset = pBottom + bBottom
  const leftInset = pLeft + bLeft

  textMatrixPosition.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0)
  return new Matrix4().compose(textMatrixPosition, IdentityQuaternion, IdentityScale).premultiply(globalMatrix)
}
