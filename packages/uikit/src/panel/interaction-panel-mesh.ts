import { Intersection, Matrix4, Mesh, Object3D, Plane, Sphere, Vector2, Vector2Tuple, Vector3 } from 'three'
import { ClippingRect } from '../clipping.js'
import { effect, Signal } from '@preact/signals-core'
import { OrderInfo } from '../order.js'
import { Object3DRef } from '../context.js'
import { computeMatrixWorld, Initializers } from '../internals.js'
import { clamp } from 'three/src/math/MathUtils.js'

const planeHelper = new Plane()
const vectorHelper = new Vector3()

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
    ancestorsHaveListeners?: boolean
    defaultPointerEvents?: PointerEventsProperties['pointerEvents']
  }
}

export type PointerEventsProperties = {
  pointerEvents?: 'none' | 'auto' | 'listener'
  pointerEventsType?: AllowedPointerEventsType
  pointerEventsOrder?: number
}

const sphereHelper = new Sphere()
const matrixHelper = new Matrix4()

export function makePanelSpherecast(
  rootObjectMatrixWorld: Matrix4,
  globalSphereWithLocalScale: Sphere,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  object: Object3D,
): Exclude<Mesh['spherecast'], undefined> {
  return (sphere, intersects) => {
    sphereHelper.copy(globalSphereWithLocalScale).applyMatrix4(rootObjectMatrixWorld)
    if (
      !sphereHelper.intersectsSphere(sphere) ||
      !computeMatrixWorld(object.matrixWorld, object.matrix, rootObjectMatrixWorld, globalMatrixSignal)
    ) {
      return
    }
    vectorHelper.copy(sphere.center).applyMatrix4(matrixHelper.copy(object.matrixWorld).invert())
    vectorHelper.x = clamp(vectorHelper.x, -0.5, 0.5)
    vectorHelper.y = clamp(vectorHelper.y, -0.5, 0.5)
    vectorHelper.z = 0

    const uv = new Vector2(vectorHelper.x, vectorHelper.y)

    vectorHelper.applyMatrix4(object.matrixWorld)
    const distance = sphere.center.distanceTo(vectorHelper)

    if (distance > sphere.radius) {
      return
    }

    intersects.push({
      distance,
      object,
      point: vectorHelper.clone(),
      uv,
      normal: new Vector3(0, 0, 1),
    })
  }
}

export function makePanelRaycast(
  raycast: Mesh['raycast'],
  rootObjectMatrixWorld: Matrix4,
  globalSphereWithLocalScale: Sphere,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  object: Object3D,
): Mesh['raycast'] {
  return (raycaster, intersects) => {
    sphereHelper.copy(globalSphereWithLocalScale).applyMatrix4(rootObjectMatrixWorld)
    if (
      !raycaster.ray.intersectsSphere(sphereHelper) ||
      !computeMatrixWorld(object.matrixWorld, object.matrix, rootObjectMatrixWorld, globalMatrixSignal)
    ) {
      return
    }

    raycast(raycaster, intersects)
  }
}

export function isInteractionPanel(object: Object3D) {
  return 'isInteractionPanel' in object
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
      const [w, h] = sizeValue
      const maxDiameter = Math.sqrt(w * w + h * h)
      sphere.radius = maxDiameter * 0.5 * pixelSize.value
      sphere.applyMatrix4(globalMatrix)
    }),
  )
  return sphere
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
