import { Matrix4, Vector3 } from 'three'
import { signal } from '@preact/signals-core'
import { ClippingRect, computedCornerRadiiPx } from '../src/clipping.js'
import { expect } from 'chai'
import type { Properties } from '../src/properties/index.js'

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
  const maxY = clippingRect.planes[0].constant
  const maxX = clippingRect.planes[1].constant
  const minY = -clippingRect.planes[2].constant
  const minX = -clippingRect.planes[3].constant
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

  it('should resolve rounded clipping radii like the panel material', () => {
    const properties = {
      value: {
        borderTopLeftRadius: 1000,
        borderTopRightRadius: 1000,
        borderBottomRightRadius: 1000,
        borderBottomLeftRadius: 1000,
      },
    } as unknown as Properties
    const radii = computedCornerRadiiPx(properties, signal([48, 48])).value
    expect(radii).to.not.equal(null)
    for (const radius of radii!) {
      expect(radius).to.equal(23.52)
    }
  })

  it('should not inherit rounded corners from a larger parent that does not constrain the child', () => {
    const parent = new ClippingRect(new Matrix4(), 0, 0, 100, 100, [20, 20, 20, 20])
    const child = new ClippingRect(new Matrix4(), 0, 0, 10, 10)
    child.min(parent)
    expect(child.cornerRadii).to.deep.equal([0, 0, 0, 0])
  })

  it('should require both adjacent parent sides before applying a parent corner radius', () => {
    const parent = new ClippingRect(new Matrix4(), 0, 0, 10, 10, [1, 2, 3, 4])
    const child = new ClippingRect(new Matrix4(), -2, 0, 8, 4)
    child.min(parent)
    expect(child.cornerRadii).to.deep.equal([0, 0, 0, 0])
  })

  it('should keep the source radius when both adjacent parent sides constrain a corner', () => {
    const parent = new ClippingRect(new Matrix4(), 0, 0, 10, 10, [1, 2, 3, 4])
    const child = new ClippingRect(new Matrix4(), -2, 2, 8, 8)
    child.min(parent)
    expect(child.cornerRadii).to.deep.equal([1, 0, 0, 0])
  })

  it('should pack shader radii with a sentinel only for axis-aligned clipping planes', () => {
    const rect = new ClippingRect(new Matrix4(), 0, 0, 10, 10, [1, 2, 3, 4])
    const array = new Float32Array(16)
    rect.toShaderArray(array, 0)
    expect(array[2]).to.equal(6)
    expect(array[6]).to.equal(5)
    expect(array[10]).to.equal(3)
    expect(array[14]).to.equal(4)
  })

  it('should preserve non-zero z normals instead of packing radii for tilted clipping planes', () => {
    const rect = new ClippingRect(new Matrix4().makeRotationY((65 / 180) * Math.PI), 0, 0, 10, 10, [1, 2, 3, 4])
    const array = new Float32Array(16)
    rect.toShaderArray(array, 0)
    expect(array[6]).to.be.closeTo(rect.planes[1]!.normal.z, 0.000001)
    expect(array[14]).to.be.closeTo(rect.planes[3]!.normal.z, 0.000001)
    expect(array[6]).to.be.lessThan(1.5)
  })
})
