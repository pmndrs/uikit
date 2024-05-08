import { Matrix4 } from 'three'
import { InstancedGlyphGroup } from './instanced-glyph-group.js'
import { ColorRepresentation } from '../../utils.js'
import { ClippingRect, defaultClippingData } from '../../clipping.js'
import { Font, FontFamilyProperties, GlyphInfo, glyphIntoToUV } from '../font.js'
import { Signal, computed } from '@preact/signals-core'
import { GlyphLayoutProperties } from '../layout.js'
import { TextAlignProperties, TextAppearanceProperties } from './instanced-text.js'
import { writeColor } from '../../panel/index.js'

const helperMatrix1 = new Matrix4()
const helperMatrix2 = new Matrix4()

export type InstancedTextProperties = TextAlignProperties &
  TextAppearanceProperties &
  Omit<GlyphLayoutProperties, 'text' | 'font'> &
  FontFamilyProperties

export function computedGylphGroupDependencies(fontSignal: Signal<Font | undefined>) {
  return computed(() => ({ font: fontSignal.value }))
}

/**
 * renders an initially specified glyph
 */
export class InstancedGlyph {
  public index?: number

  private hidden = true

  private glyphInfo?: GlyphInfo
  private x: number = 0
  private y: number = 0
  private fontSize: number = 0
  private pixelSize: number = 0

  constructor(
    private readonly group: InstancedGlyphGroup,
    //modifiable using update...
    private baseMatrix: Matrix4 | undefined,
    private color: ColorRepresentation,
    private opacity: number,
    private clippingRect: ClippingRect | undefined,
  ) {}

  getX(widthMultiplier: number): number {
    if (this.glyphInfo == null) {
      return this.x
    }
    return this.x + widthMultiplier * this.glyphInfo.width * this.fontSize
  }

  show(): void {
    if (!this.hidden) {
      return
    }
    this.hidden = false
    this.group.requestActivate(this)
  }

  hide(): void {
    if (this.hidden) {
      return
    }
    this.hidden = true
    this.group.delete(this)
  }

  activate(index: number): void {
    this.index = index
    this.writeUpdatedMatrix()
    this.writeUV()
    this.updateColor(this.color)
    this.updateOpacity(this.opacity)
    this.updateClippingRect(this.clippingRect)
  }

  setIndex(index: number): void {
    this.index = index
  }

  updateClippingRect(clippingRect: ClippingRect | undefined): void {
    this.clippingRect = clippingRect
    if (this.index == null) {
      return
    }
    const offset = this.index * 16
    const { instanceClipping, root } = this.group
    if (this.clippingRect == null) {
      instanceClipping.set(defaultClippingData, offset)
    } else {
      this.clippingRect.toArray(instanceClipping.array, offset)
    }
    instanceClipping.addUpdateRange(offset, 16)
    instanceClipping.needsUpdate = true
    root.requestRender()
  }

  updateColor(color: ColorRepresentation): void {
    this.color = color
    if (this.index == null) {
      return
    }
    const { instanceRGBA, root } = this.group
    const offset = instanceRGBA.itemSize * this.index
    writeColor(instanceRGBA.array, offset, color, undefined)
    instanceRGBA.addUpdateRange(offset, 3)
    instanceRGBA.needsUpdate = true
    root.requestRender()
  }

  updateOpacity(opacity: number): void {
    this.opacity = opacity
    if (this.index == null) {
      return
    }
    const { instanceRGBA, root } = this.group
    const bufferIndex = this.index * 4 + 3
    instanceRGBA.array[bufferIndex] = opacity
    instanceRGBA.addUpdateRange(bufferIndex, 1)
    instanceRGBA.needsUpdate = true
    root.requestRender()
  }

  updateGlyphAndTransformation(glyphInfo: GlyphInfo, x: number, y: number, fontSize: number, pixelSize: number): void {
    if (
      this.glyphInfo === glyphInfo &&
      this.x === x &&
      this.y === y &&
      this.fontSize === fontSize &&
      this.pixelSize === pixelSize
    ) {
      return
    }
    if (this.glyphInfo != glyphInfo) {
      this.glyphInfo = glyphInfo
      this.writeUV()
    }
    this.x = x
    this.y = y
    this.fontSize = fontSize
    this.pixelSize = pixelSize
    this.writeUpdatedMatrix()
  }

  updateBaseMatrix(baseMatrix: Matrix4): void {
    if (this.baseMatrix === baseMatrix) {
      return
    }
    this.baseMatrix = baseMatrix
    this.writeUpdatedMatrix()
  }

  private writeUV(): void {
    if (this.index == null || this.glyphInfo == null) {
      return
    }
    const offset = this.index * 4
    const { instanceUV, root } = this.group
    glyphIntoToUV(this.glyphInfo, instanceUV.array, offset)
    instanceUV.addUpdateRange(offset, 4)
    instanceUV.needsUpdate = true
    root.requestRender()
  }

  private writeUpdatedMatrix(): void {
    if (this.index == null || this.glyphInfo == null || this.baseMatrix == null) {
      return
    }
    const offset = this.index * 16
    const { instanceMatrix, root } = this.group
    instanceMatrix.addUpdateRange(offset, 16)
    helperMatrix1
      .makeTranslation(this.x * this.pixelSize, this.y * this.pixelSize, 0)
      .multiply(
        helperMatrix2.makeScale(
          this.fontSize * this.glyphInfo.width * this.pixelSize,
          this.fontSize * this.glyphInfo.height * this.pixelSize,
          1,
        ),
      )
      .premultiply(this.baseMatrix)
    helperMatrix1.toArray(instanceMatrix.array, offset)
    instanceMatrix.needsUpdate = true
    root.requestRender()
  }
}
