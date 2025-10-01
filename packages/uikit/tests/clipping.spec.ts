import { Matrix4, Vector3 } from 'three'
import { ClippingRect } from '../src/clipping.js'
import { expect } from 'chai'

// Plane order: [bottom, left, top, right]
const defaultPlaneNormals = [new Vector3(0, -1, 0), new Vector3(-1, 0, 0), new Vector3(0, 1, 0), new Vector3(1, 0, 0)]

function expectClippingCenterAndSize(
  clippingRect: ClippingRect,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
): void {
  for (let i = 0; i < 4; i++) {
    expect(clippingRect.planes[i].normal.distanceTo(defaultPlaneNormals[i])).to.be.lessThan(0.01)
  }

  // Extract bounds from transformed planes using coplanar points
  // Each plane's coplanarPoint gives us a point on that plane's boundary
  const [bottomPlane, leftPlane, topPlane, rightPlane] = clippingRect.planes
  const bottomPoint = bottomPlane.coplanarPoint(new Vector3())
  const leftPoint = leftPlane.coplanarPoint(new Vector3())
  const topPoint = topPlane.coplanarPoint(new Vector3())
  const rightPoint = rightPlane.coplanarPoint(new Vector3())

  // For axis-aligned planes, the coplanar point's relevant coordinate gives us the boundary
  const minY = topPoint.y
  const minX = rightPoint.x
  const maxY = bottomPoint.y
  const maxX = leftPoint.x

  const actualCenterX = (maxX + minX) * 0.5
  const actualCenterY = (maxY + minY) * 0.5
  const actualWidth = maxX - minX
  const actualHeight = maxY - minY

  expect(actualCenterX).to.be.closeTo(centerX, 0.01)
  expect(actualCenterY).to.be.closeTo(centerY, 0.01)
  expect(actualWidth).to.be.closeTo(width, 0.01)
  expect(actualHeight).to.be.closeTo(height, 0.01)
}

describe('clipping', () => {
  it('should setup planes', () => {
    const rect1 = new ClippingRect(new Matrix4().makeTranslation(new Vector3(44, 55, 0)), 0, 0, 10, 22)
    expectClippingCenterAndSize(rect1, 44, 55, 10, 22)
  })

  it('should intersect of 2 translated clips', () => {
    const rect1 = new ClippingRect(new Matrix4().makeTranslation(new Vector3(0, 0, 0)), 0, 0, 2, 1)
    const rect2 = new ClippingRect(new Matrix4().makeTranslation(new Vector3(0.5, -1, 0)), 0, 0, 1, 2)
    rect1.min(rect2)
    expectClippingCenterAndSize(rect1, 0.5, -0.25, 1, 0.5)
  })

  it('should intersect of 2 translated clips (inverted min call)', () => {
    const rect1 = new ClippingRect(new Matrix4().makeTranslation(new Vector3(0, 0, 0)), 0, 0, 2, 1)
    const rect2 = new ClippingRect(new Matrix4().makeTranslation(new Vector3(0.5, -1, 0)), 0, 0, 1, 2)
    rect2.min(rect1)
    expectClippingCenterAndSize(rect2, 0.5, -0.25, 1, 0.5)
  })

  it('should intersect intersect clip with clip rotated on x-axis', () => {
    const rect1 = new ClippingRect(new Matrix4(), 0, 0, 1, 1)
    const rect2 = new ClippingRect(new Matrix4().makeRotationY((65 / 180) * Math.PI), 0, 0, 0.5, 1)
    rect1.min(rect2)
    expectClippingCenterAndSize(rect1, 0, 0, 1, 1)
  })
})
