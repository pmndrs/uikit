import { Intersection, Mesh, Object3D, Object3DEventMap, Plane, Raycaster, Vector3 } from 'three'
import { ClippingRect } from '../clipping.js'
import { Signal } from '@preact/signals-core'
import { OrderInfo } from '../order.js'
import { Object3DRef } from '../context.js'

const planeHelper = new Plane()
const vectorHelper = new Vector3()

const sides: Array<Plane> = [
  new Plane().setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), new Vector3(-0.5, 0, 0)),
  new Plane().setFromNormalAndCoplanarPoint(new Vector3(-1, 0, 0), new Vector3(0.5, 0, 0)),
  new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0), new Vector3(0, -0.5, 0)),
  new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, -1, 0), new Vector3(0, 0.5, 0)),
]

export function makePanelRaycast(mesh: Mesh): Mesh['raycast'] {
  return (raycaster: Raycaster, intersects: Array<Intersection<Object3D<Object3DEventMap>>>) => {
    const matrixWorld = mesh.matrixWorld
    planeHelper.constant = 0
    planeHelper.normal.set(0, 0, 1)
    planeHelper.applyMatrix4(matrixWorld)
    if (
      planeHelper.distanceToPoint(raycaster.ray.origin) < 0 ||
      raycaster.ray.intersectPlane(planeHelper, vectorHelper) == null
    ) {
      return
    }

    const normal = planeHelper.normal.clone()

    for (let i = 0; i < 4; i++) {
      const side = sides[i]
      planeHelper.copy(side).applyMatrix4(matrixWorld)
      if (planeHelper.distanceToPoint(vectorHelper) < 0) {
        return
      }
    }

    intersects.push({
      distance: vectorHelper.distanceTo(raycaster.ray.origin),
      object: mesh,
      point: vectorHelper.clone(),
      normal,
    })
  }
}

export function makeClippedRaycast(
  mesh: Mesh,
  fn: Mesh['raycast'],
  rootObject: Object3DRef,
  clippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo>,
): Mesh['raycast'] {
  return (raycaster: Raycaster, intersects: Intersection<Object3D<Object3DEventMap>>[]) => {
    const obj = rootObject instanceof Object3D ? rootObject : rootObject.current
    if (obj == null) {
      return
    }
    const { majorIndex, minorIndex, elementType } = orderInfo.value
    const oldLength = intersects.length
    fn.call(mesh, raycaster, intersects)
    const clippingPlanes = clippingRect?.value?.planes
    const outerMatrixWorld = obj.matrixWorld
    outer: for (let i = intersects.length - 1; i >= oldLength; i--) {
      const intersection = intersects[i]
      intersection.distance -=
        majorIndex * 0.01 +
        elementType * 0.001 + //1-10
        minorIndex * 0.00001 //1-100
      if (clippingPlanes == null) {
        continue
      }
      for (let ii = 0; ii < 4; ii++) {
        planeHelper.copy(clippingPlanes[ii]).applyMatrix4(outerMatrixWorld)
        if (planeHelper.distanceToPoint(intersection.point) < 0) {
          intersects.splice(i, 1)
          continue outer
        }
      }
    }
  }
}
