import { Intersection, Matrix4, Mesh, Object3D, Plane, Sphere, Vector2, Vector2Tuple, Vector3 } from 'three'
import { ClippingRect } from '../clipping.js'
import { Signal } from '@preact/signals-core'
import { OrderInfo } from '../order.js'
import { clamp } from 'three/src/math/MathUtils.js'
import {
  computeMatrixWorld,
  createContainerState,
  createContentState,
  createCustomContainerState,
  createIconState,
  createImageState,
  createInputState,
  createSvgState,
  createTextState,
} from '../components/index.js'
import { FlexNodeState } from '../flex/node.js'
import { abortableEffect } from '../utils.js'
import { Properties } from '../properties/index.js'

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
  rootObject: Object3D,
  globalSphereWithLocalScale: Sphere,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  object: Object3D,
): Exclude<Mesh['spherecast'], undefined> {
  return (sphere, intersects) => {
    sphereHelper.copy(globalSphereWithLocalScale).applyMatrix4(rootObject.matrixWorld)
    if (
      !sphereHelper.intersectsSphere(sphere) ||
      !computeMatrixWorld(object.matrixWorld, rootObject.matrixWorld, globalMatrixSignal)
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
  rootObject: Object3D,
  globalSphereWithLocalScale: Sphere,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  object: Object3D,
): Mesh['raycast'] {
  return (raycaster, intersects) => {
    sphereHelper.copy(globalSphereWithLocalScale).applyMatrix4(rootObject.matrixWorld)
    if (
      !raycaster.ray.intersectsSphere(sphereHelper) ||
      !computeMatrixWorld(object.matrixWorld, rootObject.matrixWorld, globalMatrixSignal)
    ) {
      return
    }

    raycast(raycaster, intersects)
  }
}

export function setupBoundingSphere(
  target: Sphere,
  pixelSize: Signal<number>,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    const sizeValue = size.value
    const globalMatrix = globalMatrixSignal.value
    if (sizeValue == null || globalMatrix == null) {
      return
    }
    target.center.set(0, 0, 0)
    const [w, h] = sizeValue
    const maxDiameter = Math.sqrt(w * w + h * h)
    target.radius = maxDiameter * 0.5 * pixelSize.value
    target.applyMatrix4(globalMatrix)
  }, abortSignal)
}

/**
 * clips the sphere / raycast
 * also marks the mesh as a interaction panel
 */
export function makeClippedCast<T extends Mesh['raycast'] | Exclude<Mesh['spherecast'], undefined>>(
  mesh: Mesh,
  fn: T,
  rootObject: Object3D,
  clippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfoSignal: Signal<OrderInfo | undefined>,
  internals: FlexNodeState,
) {
  Object.assign(mesh, { internals })
  return (raycaster: Parameters<T>[0], intersects: Parameters<T>[1]) => {
    const oldLength = intersects.length
    ;(fn as any).call(mesh, raycaster, intersects)
    if (oldLength === intersects.length) {
      return
    }
    const orderInfo = orderInfoSignal.peek()
    if (orderInfo == null) {
      return
    }
    const clippingPlanes = clippingRect?.peek()?.planes
    const rootMatrixWorld = rootObject.matrixWorld
    outer: for (let i = intersects.length - 1; i >= oldLength; i--) {
      const intersection = intersects[i]!
      intersection.distance -=
        orderInfo.majorIndex * 0.01 +
        orderInfo.elementType * 0.001 + //1-10
        orderInfo.minorIndex * 0.00001 //1-100
      if (clippingPlanes == null) {
        continue
      }
      for (let ii = 0; ii < 4; ii++) {
        planeHelper.copy(clippingPlanes[ii]!).applyMatrix4(rootMatrixWorld)
        if (planeHelper.distanceToPoint(intersection.point) < 0) {
          intersects.splice(i, 1)
          continue outer
        }
      }
    }
  }
}
