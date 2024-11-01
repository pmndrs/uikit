import { Intersection, Matrix4, Mesh, Object3D, Plane, Ray, Sphere, Vector2, Vector2Tuple, Vector3 } from 'three'
import { ClippingRect } from '../clipping.js'
import { effect, Signal } from '@preact/signals-core'
import { OrderInfo } from '../order.js'
import { Object3DRef, RootContext } from '../context.js'
import { computeMatrixWorld, Initializers } from '../internals.js'

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

export type AllowedPointerEventsType =
  | 'all'
  | ((poinerId: number, pointerType: string, pointerState: unknown) => boolean)
  | { allow: string | Array<string> }
  | { deny: string | Array<string> }

declare module 'three' {
  interface Object3D extends PointerEventsProperties {
    spherecast?(sphere: Sphere, intersects: Array<Intersection>): void
    intersectChildren?: boolean
    interactableDescendants?: Array<Object3D>
    defaultPointerEvents?: PointerEventsProperties['pointerEvents']
  }
}

export type PointerEventsProperties = {
  pointerEvents?: 'none' | 'auto' | 'listener'
  pointerEventsType?: AllowedPointerEventsType
  pointerEventsOrder?: number
}

const scaleHelper = new Vector3()
const matrixHelper = new Matrix4()

function isSingularMatrix(matrix: Matrix4) {
  scaleHelper.setFromMatrixScale(matrix)
  return scaleHelper.x === 0 || scaleHelper.y === 0 || scaleHelper.z === 0
}

const sphereHelper = new Sphere()

export function makePanelSpherecast(
  rootObjectMatrixWorld: Matrix4,
  globalSphereWithLocalScale: Sphere,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  object: Object3D,
): Exclude<Mesh['spherecast'], undefined> {
  return (sphere, intersects) => {
    sphereHelper.copy(globalSphereWithLocalScale).applyMatrix4(rootObjectMatrixWorld)
    if (!sphereHelper.intersectsSphere(sphere)) {
      return
    }
    if (
      isSingularMatrix(matrixHelper) ||
      !computeMatrixWorld(matrixHelper, object.matrix, rootObjectMatrixWorld, globalMatrixSignal)
    ) {
      return
    }
    planeHelper.constant = 0
    planeHelper.normal.set(0, 0, 1)
    planeHelper.applyMatrix4(matrixHelper)

    planeHelper.projectPoint(sphere.center, vectorHelper)

    if (vectorHelper.distanceToSquared(sphere.center) > sphere.radius * sphere.radius) {
      return
    }

    for (let i = 0; i < 4; i++) {
      const side = sides[i]
      planeHelper.copy(side).applyMatrix4(matrixHelper)

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
      object,
      point: vectorHelper.clone(),
      uv: new Vector2(
        distancesHelper[0] / (distancesHelper[0] + distancesHelper[1]),
        distancesHelper[3] / (distancesHelper[2] + distancesHelper[3]),
      ),
      normal: new Vector3(0, 0, 1),
    })
  }
}

export function computedBoundingSphere(
  pixelSize: Signal<number>,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  initializers: Initializers,
) {
  const sphere = new Sphere()
  initializers.push(() =>
    effect(() => {
      const sizeValue = size.value
      const globalMatrix = globalMatrixSignal.value
      if (sizeValue == null || globalMatrix == null) {
        return
      }
      sphere.center.set(0, 0, 0)
      sphere.radius = 0.5
      sphere.applyMatrix4(globalMatrix)
      sphere.radius *= Math.max(...sizeValue) * pixelSize.value
    }),
  )
  return sphere
}

export function makePanelRaycast(
  rootObjectMatrixWorld: Matrix4,
  globalSphereWithLocalScale: Sphere,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  object: Object3D,
): Mesh['raycast'] {
  return (raycaster, intersects) => {
    sphereHelper.copy(globalSphereWithLocalScale).applyMatrix4(rootObjectMatrixWorld)
    if (!raycaster.ray.intersectsSphere(sphereHelper)) {
      return
    }
    if (
      !computeMatrixWorld(matrixHelper, object.matrix, rootObjectMatrixWorld, globalMatrixSignal) ||
      isSingularMatrix(matrixHelper)
    ) {
      return
    }
    planeHelper.constant = 0
    planeHelper.normal.set(0, 0, 1)
    planeHelper.applyMatrix4(matrixHelper)
    if (raycaster.ray.intersectPlane(planeHelper, vectorHelper) == null) {
      return
    }

    for (let i = 0; i < 4; i++) {
      const side = sides[i]
      planeHelper.copy(side).applyMatrix4(matrixHelper)
      if ((distancesHelper[i] = planeHelper.distanceToPoint(vectorHelper)) < 0) {
        return
      }
    }

    intersects.push({
      distance: vectorHelper.distanceTo(raycaster.ray.origin),
      object,
      point: vectorHelper.clone(),
      uv: new Vector2(
        distancesHelper[0] / (distancesHelper[0] + distancesHelper[1]),
        distancesHelper[3] / (distancesHelper[2] + distancesHelper[3]),
      ),
      normal: new Vector3(0, 0, 1),
    })
  }
}

export function isInteractionPanel(object: Object3D) {
  return 'isInteractionPanel' in object
}

/**
 * clips the sphere / raycast
 * also marks the mesh as a interaction panel
 */
export function makeClippedCast<T extends Mesh['raycast'] | Exclude<Mesh['spherecast'], undefined>>(
  mesh: Mesh,
  fn: T,
  rootObjectRef: Object3DRef,
  clippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfoSignal: Signal<OrderInfo | undefined>,
) {
  Object.assign(mesh, { isInteractionPanel: true })
  return (raycaster: Parameters<T>[0], intersects: Parameters<T>[1]) => {
    const oldLength = intersects.length
    ;(fn as any).call(mesh, raycaster, intersects)
    if (oldLength === intersects.length) {
      return
    }
    const rootObject = rootObjectRef.current
    const orderInfo = orderInfoSignal.peek()
    if (rootObject == null || orderInfo == null) {
      return
    }
    const clippingPlanes = clippingRect?.peek()?.planes
    const rootMatrixWorld = rootObject.matrixWorld
    outer: for (let i = intersects.length - 1; i >= oldLength; i--) {
      const intersection = intersects[i]
      intersection.distance -=
        orderInfo.majorIndex * 0.01 +
        orderInfo.elementType * 0.001 + //1-10
        orderInfo.minorIndex * 0.00001 //1-100
      if (clippingPlanes == null) {
        continue
      }
      for (let ii = 0; ii < 4; ii++) {
        planeHelper.copy(clippingPlanes[ii]).applyMatrix4(rootMatrixWorld)
        if (planeHelper.distanceToPoint(intersection.point) < 0) {
          intersects.splice(i, 1)
          continue outer
        }
      }
    }
  }
}
