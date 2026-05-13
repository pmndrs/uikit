import { Signal } from '@preact/signals-core'
import { Matrix4, Mesh, Plane, Vector3 } from 'three'
import { Component } from '../../components/component.js'
import { Container } from '../../components/container.js'
import { RootContext } from '../../context.js'
import { OrderInfo } from '../../order.js'
import { computeWorldToGlobalMatrix } from '../../utils.js'

const planeHelper = new Plane()
const worldToGlobalMatrixHelper = new Matrix4()

export function makeClippedCast<T extends Mesh['raycast'] | Exclude<Mesh['spherecast'], undefined>>(
  component: Component,
  fn: T,
  root: Signal<RootContext>,
  parent: Signal<Container | undefined>,
  orderInfoSignal: Signal<OrderInfo | undefined>,
) {
  return (raycaster: Parameters<T>[0], intersects: Parameters<T>[1]): unknown => {
    const oldLength = intersects.length
    const fnResult = (fn as any).call(component, raycaster, intersects)
    if (oldLength === intersects.length) {
      return fnResult
    }
    const orderInfo = orderInfoSignal.peek()
    if (orderInfo == null) {
      return fnResult
    }
    const clippingPlanes = parent.peek()?.clippingRect?.peek()?.planes
    root.peek().component.updateMatrix()
    computeWorldToGlobalMatrix(root.peek(), worldToGlobalMatrixHelper)
    outer: for (let i = intersects.length - 1; i >= oldLength; i--) {
      const intersection = intersects[i]!
      intersection.distance -=
        orderInfo.majorIndex * 0.01 +
        orderInfo.minorIndex * 0.0001 +
        orderInfo.elementType * 0.00001 +
        orderInfo.patchIndex * 0.0000001
      if (clippingPlanes == null) {
        continue
      }
      for (let ii = 0; ii < 4; ii++) {
        planeHelper.copy(clippingPlanes[ii]!).applyMatrix4(worldToGlobalMatrixHelper)
        if (planeHelper.distanceToPoint(intersection.point as Vector3) < 0) {
          intersects.splice(i, 1)
          continue outer
        }
      }
    }
    return fnResult
  }
}
