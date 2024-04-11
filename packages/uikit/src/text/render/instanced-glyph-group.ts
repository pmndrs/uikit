import { DynamicDrawUsage, InstancedBufferAttribute, Material, TypedArray } from 'three'
import { InstancedGlyph } from './instanced-glyph.js'
import { InstancedGlyphMesh } from './instanced-glyph-mesh.js'
import { InstancedGlyphMaterial } from './instanced-gylph-material.js'
import { Font } from '../font.js'
import { ElementType, OrderInfo, WithCameraDistance, setupRenderOrder } from '../../order.js'
import { Object3DRef } from '../../context.js'
import { Signal } from '@preact/signals-core'

export class GlyphGroupManager {
  private map = new Map<Font, Map<number, InstancedGlyphGroup>>()
  constructor(
    private pixelSize: Signal<number>,
    private rootCameraDistance: WithCameraDistance,
    private object: Object3DRef,
  ) {}

  getGroup(majorIndex: number, font: Font) {
    let groups = this.map.get(font)
    if (groups == null) {
      this.map.set(font, (groups = new Map()))
    }
    let glyphGroup = groups?.get(majorIndex)
    if (glyphGroup == null) {
      groups.set(
        majorIndex,
        (glyphGroup = new InstancedGlyphGroup(this.object, font, this.pixelSize, this.rootCameraDistance, {
          majorIndex,
          elementType: ElementType.Text,
          minorIndex: 0,
        })),
      )
    }
    return glyphGroup
  }

  onFrame = (delta: number) => {
    for (const groups of this.map.values()) {
      for (const group of groups.values()) {
        group.onFrame(delta)
      }
    }
  }
}

export class InstancedGlyphGroup {
  public instanceMatrix!: InstancedBufferAttribute
  public instanceUV!: InstancedBufferAttribute
  public instanceRGBA!: InstancedBufferAttribute
  public instanceClipping!: InstancedBufferAttribute

  private glyphs: Array<InstancedGlyph | undefined> = []
  private requestedGlyphs: Array<InstancedGlyph> = []
  private holeIndicies: Array<number> = []
  private mesh?: InstancedGlyphMesh

  private instanceMaterial: Material

  private timeTillDecimate?: number

  constructor(
    private object: Object3DRef,
    font: Font,
    public readonly pixelSize: Signal<number>,
    private readonly rootCameraDistance: WithCameraDistance,
    private orderInfo: OrderInfo,
  ) {
    this.instanceMaterial = new InstancedGlyphMaterial(font)
  }

  requestActivate(glyph: InstancedGlyph): void {
    const holeIndex = this.holeIndicies.shift()
    if (holeIndex != null) {
      //inserting into existing hole
      this.glyphs[holeIndex] = glyph
      glyph.activate(holeIndex)
      return
    }

    if (this.mesh == null || this.mesh.count >= this.instanceMatrix.count) {
      //requesting insert because no space available
      this.requestedGlyphs.push(glyph)
      return
    }

    //inserting at the end because space available
    const index = this.mesh.count
    this.glyphs[index] = glyph
    glyph.activate(index)
    this.mesh.count += 1
    return
  }

  delete(glyph: InstancedGlyph): void {
    if (glyph.index == null) {
      const indexInRequested = this.requestedGlyphs.indexOf(glyph)
      if (indexInRequested === -1) {
        return
      }
      this.requestedGlyphs.splice(indexInRequested, 1)
      return
    }

    const replacement = this.requestedGlyphs.shift()
    if (replacement != null) {
      //replace
      replacement.activate(glyph.index)
      this.glyphs[glyph.index] = replacement
      glyph.index = undefined
      return
    }

    if (glyph.index === this.glyphs.length - 1) {
      //remove at the end
      this.glyphs.length -= 1
      this.mesh!.count -= 1
      glyph.index = undefined
      return
    }

    //remove in between
    //hiding the glyph by writing a 0 matrix (0 scale ...)
    const bufferOffset = glyph.index * 16
    this.instanceMatrix.array.fill(0, bufferOffset, bufferOffset + 16)
    this.instanceMatrix.addUpdateRange(bufferOffset, 16)
    this.instanceMatrix.needsUpdate = true
    this.holeIndicies.push(glyph.index)
    this.glyphs[glyph.index] = undefined
    glyph.index = undefined
  }

  onFrame(delta: number): void {
    const requiredSize = this.glyphs.length - this.holeIndicies.length + this.requestedGlyphs.length

    if (this.mesh != null) {
      this.mesh.visible = requiredSize > 0
    }

    if (requiredSize === 0) {
      return
    }

    const availableSize = this.instanceMatrix?.count ?? 0

    //if the buffer is continously to small over a period of 1 second, it will be decimated
    if (requiredSize < availableSize / 3) {
      this.timeTillDecimate ??= 1
    } else {
      this.timeTillDecimate = undefined
    }
    if (this.timeTillDecimate != null) {
      this.timeTillDecimate -= delta
    }

    if ((this.timeTillDecimate == null || this.timeTillDecimate > 0) && requiredSize <= availableSize) {
      return
    }
    this.timeTillDecimate = undefined
    this.resize(requiredSize)
    const indexOffset = this.mesh!.count
    const requestedGlyphsLength = this.requestedGlyphs.length
    for (let i = 0; i < requestedGlyphsLength; i++) {
      const glyph = this.requestedGlyphs[i]
      glyph.activate(indexOffset + i)
      this.glyphs[indexOffset + i] = glyph
    }
    this.mesh!.count += requestedGlyphsLength
    this.mesh!.visible = true
    this.requestedGlyphs.length = 0
  }

  private resize(neededSize: number): void {
    const newSize = Math.ceil(neededSize * 1.5)
    const matrixArray = new Float32Array(newSize * 16)
    const uvArray = new Float32Array(newSize * 4)
    const rgbaArray = new Float32Array(newSize * 4)
    const clippingArray = new Float32Array(newSize * 16)
    this.instanceMatrix = new InstancedBufferAttribute(matrixArray, 16, false)
    this.instanceMatrix.setUsage(DynamicDrawUsage)
    this.instanceUV = new InstancedBufferAttribute(uvArray, 4, false)
    this.instanceUV.setUsage(DynamicDrawUsage)
    this.instanceRGBA = new InstancedBufferAttribute(rgbaArray, 4, false)
    this.instanceRGBA.setUsage(DynamicDrawUsage)
    this.instanceClipping = new InstancedBufferAttribute(clippingArray, 16, false)
    this.instanceClipping.setUsage(DynamicDrawUsage)
    const oldMesh = this.mesh
    this.mesh = new InstancedGlyphMesh(
      this.instanceMatrix,
      this.instanceRGBA,
      this.instanceUV,
      this.instanceClipping,
      this.instanceMaterial,
    )

    //copy over old arrays and merging the holes
    if (oldMesh != null) {
      this.holeIndicies.sort((i1, i2) => i1 - i2)
      const holesLength = this.holeIndicies.length
      let afterPrevHoleIndex = 0
      let i = 0
      while (i < holesLength) {
        const holeIndex = this.holeIndicies[i]
        copyBuffer(afterPrevHoleIndex - i, afterPrevHoleIndex, holeIndex, oldMesh, this.mesh)
        afterPrevHoleIndex = holeIndex + 1
        this.glyphs.splice(holeIndex - i, 1)
        i++
      }
      copyBuffer(afterPrevHoleIndex - i, afterPrevHoleIndex, oldMesh.count, oldMesh, this.mesh)

      if (this.holeIndicies.length > 0) {
        for (let i = this.holeIndicies[0]; i < this.glyphs.length; i++) {
          this.glyphs[i]!.setIndex(i)
        }
      }
      this.holeIndicies.length = 0

      //destroying the old mesh
      this.object.current?.remove(oldMesh)
      oldMesh.dispose()
    }

    //finalizing the new mesh
    setupRenderOrder(this.mesh, this.rootCameraDistance, { value: this.orderInfo })
    this.mesh.count = this.glyphs.length
    this.object.current?.add(this.mesh)
  }
}

function copyBuffer(
  target: number,
  start: number,
  end: number,
  oldMesh: InstancedGlyphMesh,
  newMesh: InstancedGlyphMesh,
) {
  copy(target, start, end, oldMesh.instanceMatrix.array, newMesh.instanceMatrix.array, 16)
  copy(target, start, end, oldMesh.instanceUV.array, newMesh.instanceUV.array, 4)
  copy(target, start, end, oldMesh.instanceRGBA.array, newMesh.instanceRGBA.array, 4)
  copy(target, start, end, oldMesh.instanceClipping.array, newMesh.instanceClipping.array, 16)
}

function copy(target: number, start: number, end: number, from: TypedArray, to: TypedArray, itemSize: number): void {
  if (start === end) {
    return
  }
  const targetIndex = target * itemSize
  const startIndex = start * itemSize
  const endIndex = end * itemSize
  to.set(from.subarray(startIndex, endIndex), targetIndex)
}
