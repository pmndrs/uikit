import { Signal, computed } from '@preact/signals-core'
import { Matrix4, Plane, Vector3 } from 'three'
import type { Box3, Line3, Matrix3, Sphere, Vector2Tuple } from 'three'
import { Overflow } from 'yoga-layout/load'
import { Container } from './components/container.js'
import { Component } from './components/component.js'
import type { Properties } from './properties/index.js'
import { Fix_TS_56_Float32Array } from './utils.js'
import { resolvePanelBorderRadius } from './panel/material/radius.js'

const dotLt45deg = Math.cos((45 / 180) * Math.PI)
const packedCornerRadiusOffset = 2
const packablePlaneZEpsilon = 1e-5

const helperPlanes = [new Plane(), new Plane(), new Plane(), new Plane()]
const positionHelper = new Vector3()

/** Per-corner radii ordered [top-left, top-right, bottom-right, bottom-left]. */
export type CornerRadii = [number, number, number, number]

type SideIndex = 0 | 1 | 2 | 3
type SideSource = { readonly rect: ClippingRect; readonly side: SideIndex }

const cornerSides = [
  [2, 1],
  [2, 3],
  [0, 3],
  [0, 1],
] as const satisfies ReadonlyArray<readonly [SideIndex, SideIndex]>

function getCornerIndexForSides(side1: SideIndex, side2: SideIndex): number | undefined {
  for (let i = 0; i < 4; i++) {
    const [c1, c2] = cornerSides[i]!
    if ((side1 === c1 && side2 === c2) || (side1 === c2 && side2 === c1)) {
      return i
    }
  }
  return undefined
}

export class ClippingRect {
  public readonly planes: Array<Plane>

  /**
   * Per-corner radii in world-space distance units, ordered
   * [top-left, top-right, bottom-right, bottom-left]. These radii describe
   * the final intersected rect. A corner only keeps a radius when both of its
   * adjacent planes come from the same source rounded rect.
   */
  public readonly cornerRadii: CornerRadii = [0, 0, 0, 0]

  private readonly ownCornerRadii: CornerRadii = [0, 0, 0, 0]
  private readonly facePlane: Plane
  private readonly originalCenter: Vector3
  private readonly sideSources: [SideSource, SideSource, SideSource, SideSource]

  constructor(
    globalMatrix: Matrix4,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
    cornerRadii?: CornerRadii | null,
  ) {
    this.originalCenter = new Vector3(centerX, centerY, 0).applyMatrix4(globalMatrix)
    this.facePlane = new Plane(new Vector3(0, 0, 1), 0).applyMatrix4(globalMatrix)
    this.sideSources = [
      { rect: this, side: 0 },
      { rect: this, side: 1 },
      { rect: this, side: 2 },
      { rect: this, side: 3 },
    ]
    const halfWidth = width / 2
    const halfHeight = height / 2
    const top = centerY + halfHeight
    const right = centerX + halfWidth
    const bottom = -centerY + halfHeight
    const left = -centerX + halfWidth

    this.planes = [
      new Plane(new Vector3(0, -1, 0), bottom).applyMatrix4(globalMatrix),
      new Plane(new Vector3(-1, 0, 0), left).applyMatrix4(globalMatrix),
      new Plane(new Vector3(0, 1, 0), top).applyMatrix4(globalMatrix),
      new Plane(new Vector3(1, 0, 0), right).applyMatrix4(globalMatrix),
    ]

    if (cornerRadii != null) {
      this.ownCornerRadii[0] = cornerRadii[0]
      this.ownCornerRadii[1] = cornerRadii[1]
      this.ownCornerRadii[2] = cornerRadii[2]
      this.ownCornerRadii[3] = cornerRadii[3]
      this.cornerRadii[0] = cornerRadii[0]
      this.cornerRadii[1] = cornerRadii[1]
      this.cornerRadii[2] = cornerRadii[2]
      this.cornerRadii[3] = cornerRadii[3]
    }
  }

  min(other: ClippingRect): this {
    const { planes } = other
    for (let i = 0; i < 4; i++) {
      const p1 = this.facePlane
      const p2 = planes[i]!
      const n1n2DotProduct = p1.normal.dot(p2.normal)
      if (Math.abs(n1n2DotProduct) > 0.99) {
        return this //projection unsuccessfull => clipping rect is 90 deg rotated
      }
      const helperPlane = helperPlanes[i]!
      if (Math.abs(n1n2DotProduct) < 0.01) {
        //projection unnecassary => already correctly projected
        helperPlane.copy(p2)
        continue
      }
      helperPlane.normal.crossVectors(p1.normal, p2.normal).normalize().cross(p1.normal).negate()
      //from: https://en.wikipedia.org/wiki/Plane%E2%80%93plane_intersection
      const divisor = 1 - n1n2DotProduct * n1n2DotProduct
      const c1 = (p1.constant - p2.constant * n1n2DotProduct) / divisor
      const c2 = (p2.constant - p1.constant * n1n2DotProduct) / divisor
      positionHelper.copy(p1.normal).multiplyScalar(c1).addScaledVector(p2.normal, c2)
      helperPlane.constant = -positionHelper.dot(helperPlane.normal)
    }

    //2. step: find index offset (e.g. if the child was rotate by 90deg in z-axis)
    let indexOffset = 0
    const firstPlaneNormal = this.planes[0]!.normal
    while (helperPlanes[indexOffset]!.normal.dot(firstPlaneNormal) > dotLt45deg) {
      break
    }
    //3. step: minimize (if the helper plane is smaller => copy from the planes because they have the original orientation)
    for (let i = 0; i < 4; i++) {
      const plane = this.planes[i]!
      const otherPlaneIndex = (i + indexOffset) % 4
      if (
        helperPlanes[otherPlaneIndex]!.distanceToPoint(this.originalCenter) < plane.distanceToPoint(this.originalCenter)
      ) {
        plane.copy(planes[otherPlaneIndex]!)
        this.sideSources[i] = other.sideSources[otherPlaneIndex]!
      }
    }
    this.updateCornerRadii()
    return this
  }

  toArray(array: ArrayLike<number>, offset: number) {
    for (let i = 0; i < 4; i++) {
      const { normal, constant } = this.planes[i]!
      normal.toArray(array, offset)
      ;(array as Array<number>)[offset + 3] = constant
      offset += 4
    }
  }

  toShaderArray(array: ArrayLike<number>, offset: number) {
    this.toArray(array, offset)
    if (!this.canPackCornerRadii()) {
      return
    }
    const out = array as Array<number>
    out[offset + 2] = this.cornerRadii[3]! + packedCornerRadiusOffset
    out[offset + 6] = this.cornerRadii[2]! + packedCornerRadiusOffset
    out[offset + 10] = this.cornerRadii[0]! + packedCornerRadiusOffset
    out[offset + 14] = this.cornerRadii[1]! + packedCornerRadiusOffset
  }

  private canPackCornerRadii(): boolean {
    return this.planes.every(({ normal }) => Math.abs(normal.z) < packablePlaneZEpsilon)
  }

  private updateCornerRadii(): void {
    for (let i = 0; i < 4; i++) {
      const [side1, side2] = cornerSides[i]!
      this.cornerRadii[i] = this.getSourceCornerRadius(this.sideSources[side1], this.sideSources[side2])
    }
  }

  private getSourceCornerRadius(source1: SideSource, source2: SideSource): number {
    if (source1.rect !== source2.rect) {
      return 0
    }
    const cornerIndex = getCornerIndexForSides(source1.side, source2.side)
    return cornerIndex == null ? 0 : source1.rect.ownCornerRadii[cornerIndex]!
  }
}

const helperPoints = [new Vector3(), new Vector3(), new Vector3(), new Vector3()]
const multiplier = [
  [-0.5, -0.5],
  [0.5, -0.5],
  [0.5, 0.5],
  [-0.5, 0.5],
] as const

export function computedIsClipped(
  parent: Signal<Container | undefined>,
  globalMatrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  pixelSizeSignal: Signal<number>,
): Signal<boolean> {
  return computed(() => {
    const parentValue = parent.value
    if (parentValue == null) {
      return false
    }
    const sizeValue = size.value
    if (sizeValue == null) {
      return true
    }
    const global = globalMatrix.value
    const rect = parentValue.clippingRect.value
    if (rect == null || global == null) {
      return false
    }
    const [width, height] = sizeValue
    const pixelSize = pixelSizeSignal.value
    for (let i = 0; i < 4; i++) {
      const [mx, my] = multiplier[i]!
      helperPoints[i]!.set(mx * pixelSize * width, my * pixelSize * height, 0).applyMatrix4(global)
    }

    const { planes } = rect
    let allOutside: boolean
    for (let planeIndex = 0; planeIndex < 4; planeIndex++) {
      const clippingPlane = planes[planeIndex]!
      allOutside = true
      for (let pointIndex = 0; pointIndex < 4; pointIndex++) {
        const point = helperPoints[pointIndex]!
        if (clippingPlane.distanceToPoint(point) >= 0) {
          //inside
          allOutside = false
        }
      }
      if (allOutside) {
        return true
      }
    }
    return false
  })
}

export function computedClippingRect(
  globalMatrix: Signal<Matrix4 | undefined>,
  { overflow, borderInset, size }: Component,
  pixelSizeSignal: Signal<number>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  cornerRadiiPx?: Signal<CornerRadii | null>,
): Signal<ClippingRect | undefined> {
  return computed(() => {
    const global = globalMatrix.value
    const parentClippingRectValue = parentClippingRect?.value
    if (global == null || overflow.value === Overflow.Visible) {
      return parentClippingRectValue
    }
    const sizeValue = size.value
    const borderInsetValue = borderInset.value
    if (sizeValue == null || borderInsetValue == null) {
      return undefined
    }
    const [width, height] = sizeValue
    const [top, right, bottom, left] = borderInsetValue
    const pixelSize = pixelSizeSignal.value
    const radiiPxValue = cornerRadiiPx?.value
    const cornerRadii: CornerRadii | null =
      radiiPxValue == null
        ? null
        : [
            radiiPxValue[0] * pixelSize,
            radiiPxValue[1] * pixelSize,
            radiiPxValue[2] * pixelSize,
            radiiPxValue[3] * pixelSize,
          ]
    const rect = new ClippingRect(
      global,
      ((right - left) * pixelSize) / 2,
      ((top - bottom) * pixelSize) / 2,
      (width - left - right) * pixelSize,
      (height - top - bottom) * pixelSize,
      cornerRadii,
    )
    if (parentClippingRectValue != null) {
      rect.min(parentClippingRectValue)
    }
    return rect
  })
}

export const NoClippingPlane = new Plane(new Vector3(-1, 0, 0), Number.MAX_SAFE_INTEGER)
export const defaultClippingData: Fix_TS_56_Float32Array = new Float32Array(16)
for (let i = 0; i < 4; i++) {
  NoClippingPlane.normal.toArray(defaultClippingData, i * 4)
  defaultClippingData[i * 4 + 3] = NoClippingPlane.constant
}

/**
 * Resolve the four per-corner border radii against the node's current height,
 * using the same quantization as the panel material. Returns null when all
 * four corners are zero so callers can keep the existing rect-only fast path.
 */
export function computedCornerRadiiPx(
  properties: Properties,
  sizeSignal: Signal<Vector2Tuple | undefined>,
): Signal<CornerRadii | null> {
  return computed(() => {
    const p = properties.value
    const height = sizeSignal.value?.[1] ?? 0
    const resolve = (raw: number | string | undefined): number => {
      if (raw == null) {
        return 0
      }
      try {
        return resolvePanelBorderRadius(raw, height)
      } catch {
        return 0
      }
    }
    const tl = resolve(p.borderTopLeftRadius)
    const tr = resolve(p.borderTopRightRadius)
    const br = resolve(p.borderBottomRightRadius)
    const bl = resolve(p.borderBottomLeftRadius)
    if (!(tl > 0) && !(tr > 0) && !(br > 0) && !(bl > 0)) {
      return null
    }
    return [tl, tr, br, bl]
  })
}

export function createGlobalClippingPlanes(component: Component) {
  const getGlobalMatrix = () => component.root.peek().component.parent?.matrixWorld
  const planes = new Array(4)
    .fill(undefined)
    .map<Plane>(
      (_, i) =>
        new RelativePlane(() => component.parentContainer.peek()?.clippingRect.value?.planes[i], getGlobalMatrix),
    )
  return planes
}

const helperPlane = new Plane()

class RelativePlane implements Plane {
  get normal(): Vector3 {
    this.computeInto(helperPlane)
    return helperPlane.normal
  }
  get constant(): number {
    this.computeInto(helperPlane)
    return helperPlane.constant
  }
  isPlane = true as const

  constructor(
    private getLocalPlane: () => Plane | undefined,
    private getGlobalMatrix: () => Matrix4 | undefined,
  ) {}

  private computeInto(target: Plane): Plane {
    const localPlane = this.getLocalPlane()
    const globalMatrix = this.getGlobalMatrix()
    if (localPlane == null || globalMatrix == null) {
      return target.copy(NoClippingPlane)
    }
    return target.copy(localPlane).applyMatrix4(globalMatrix)
  }

  set(normal: Vector3, constant: number): Plane {
    return this
  }
  setComponents(x: number, y: number, z: number, w: number): Plane {
    return this
  }
  setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3): Plane {
    return this
  }
  setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3): Plane {
    return this
  }
  clone(): this {
    return this.computeInto(new Plane()) as this
  }
  copy(plane: Plane): this {
    this.computeInto(plane)
    return this
  }
  normalize(): Plane {
    return this
  }
  negate(): Plane {
    return this
  }
  distanceToPoint(point: Vector3): number {
    return this.computeInto(helperPlane).distanceToPoint(point)
  }
  distanceToSphere(sphere: Sphere): number {
    return this.computeInto(helperPlane).distanceToSphere(sphere)
  }
  projectPoint(point: Vector3, target: Vector3): Vector3 {
    return this.computeInto(helperPlane).projectPoint(point, target)
  }
  intersectLine(line: Line3, target: Vector3): Vector3 | null {
    return this.computeInto(helperPlane).intersectLine(line, target)
  }
  intersectsLine(line: Line3): boolean {
    return this.computeInto(helperPlane).intersectsLine(line)
  }
  intersectsBox(box: Box3): boolean {
    return this.computeInto(helperPlane).intersectsBox(box)
  }
  intersectsSphere(sphere: Sphere): boolean {
    return this.computeInto(helperPlane).intersectsSphere(sphere)
  }
  coplanarPoint(target: Vector3): Vector3 {
    return this.computeInto(helperPlane).coplanarPoint(target)
  }
  applyMatrix4(matrix: Matrix4, optionalNormalMatrix?: Matrix3): Plane {
    return this
  }
  translate(offset: Vector3): Plane {
    return this
  }
  equals(plane: Plane): boolean {
    return this.computeInto(helperPlane).equals(plane)
  }
  isIntersectionLine(l: any) {
    return this.computeInto(helperPlane).isIntersectionLine(l)
  }
}
