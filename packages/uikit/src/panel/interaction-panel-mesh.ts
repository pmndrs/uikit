import { Intersection, Matrix4, Mesh, Object3D, Plane, Sphere, Vector2, Vector3 } from 'three'
import { ClippingRect } from '../clipping.js'
import { Signal } from '@preact/signals-core'
import { OrderInfo } from '../order.js'
import { Object3DRef } from '../context.js'

const planeHelper = new Plane()
const vectorHelper = new Vector3()

const sides: Array<Plane> = [
  //left
  new Plane().setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), new Vector3(-0.5, 0, 0)),
  //right
  new Plane().setFromNormalAndCoplanarPoint(new Vector3(-1, 0, 0), new Vector3(0.5, 0, 0)),
  //bottom
  new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0), new Vector3(0, -0.5, 0)),
  //top
  new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, -1, 0), new Vector3(0, 0.5, 0)),
]

const distancesHelper = [0, 0, 0, 0]

declare module 'three' {
  interface Object3D {
    spherecast?(sphere: Sphere, intersects: Array<Intersection>): void
  }
}

const scaleHelper = new Vector3()

function isSingularMatrix(matrix: Matrix4) {
  scaleHelper.setFromMatrixScale(matrix)
  return scaleHelper.x === 0 || scaleHelper.y === 0 || scaleHelper.z === 0
}

export function makePanelSpherecast(mesh: Mesh): Exclude<Mesh['spherecast'], undefined> {
  return (sphere, intersects) => {
    const matrixWorld = mesh.matrixWorld
    if (isSingularMatrix(matrixWorld)) {
      return
    }
    planeHelper.constant = 0
    planeHelper.normal.set(0, 0, 1)
    planeHelper.applyMatrix4(matrixWorld)

    planeHelper.projectPoint(sphere.center, vectorHelper)

    if (vectorHelper.distanceToSquared(sphere.center) > sphere.radius * sphere.radius) {
      return
    }

    const normal = planeHelper.normal.clone()

    for (let i = 0; i < 4; i++) {
      const side = sides[i]
      planeHelper.copy(side).applyMatrix4(matrixWorld)

      let distance = planeHelper.distanceToPoint(vectorHelper)
      if (distance < 0) {
        if (Math.abs(distance) > sphere.radius) {
          return
        }
        //clamp point
        planeHelper.projectPoint(vectorHelper, vectorHelper)
        distance = 0
      }
      distancesHelper[i] = distance
    }

    const distance = sphere.center.distanceTo(vectorHelper)

    if (distance > sphere.radius) {
      return
    }

    intersects.push({
      distance,
      object: mesh,
      point: vectorHelper.clone(),
      uv: new Vector2(
        distancesHelper[0] / (distancesHelper[0] + distancesHelper[1]),
        distancesHelper[3] / (distancesHelper[2] + distancesHelper[3]),
      ),
      normal,
    })
  }
}

export function makePanelRaycast(mesh: Mesh): Mesh['raycast'] {
  return (raycaster, intersects) => {
    const matrixWorld = mesh.matrixWorld
    if (isSingularMatrix(matrixWorld)) {
      return
    }
    planeHelper.constant = 0
    planeHelper.normal.set(0, 0, 1)
    planeHelper.applyMatrix4(matrixWorld)
    if (
      planeHelper.distanceToPoint(raycaster.ray.origin) <= 0 ||
      raycaster.ray.intersectPlane(planeHelper, vectorHelper) == null
    ) {
      return
    }

    const normal = planeHelper.normal.clone()

    for (let i = 0; i < 4; i++) {
      const side = sides[i]
      planeHelper.copy(side).applyMatrix4(matrixWorld)
      if ((distancesHelper[i] = planeHelper.distanceToPoint(vectorHelper)) < 0) {
        return
      }
    }

    intersects.push({
      distance: vectorHelper.distanceTo(raycaster.ray.origin),
      object: mesh,
      point: vectorHelper.clone(),
      uv: new Vector2(
        distancesHelper[0] / (distancesHelper[0] + distancesHelper[1]),
        distancesHelper[3] / (distancesHelper[2] + distancesHelper[3]),
      ),
      normal,
    })
  }
}

export function makeClippedCast<T extends Mesh['raycast'] | Exclude<Mesh['spherecast'], undefined>>(
  mesh: Mesh,
  fn: T,
  rootObject: Object3DRef,
  clippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo | undefined>,
) {
  return (raycaster: Parameters<T>[0], intersects: Parameters<T>[1]) => {
    const obj = rootObject instanceof Object3D ? rootObject : rootObject.current
    if (obj == null || orderInfo.value == null) {
      return
    }
    const { majorIndex, minorIndex, elementType } = orderInfo.value
    const oldLength = intersects.length
    ;(fn as any).call(mesh, raycaster, intersects)
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
