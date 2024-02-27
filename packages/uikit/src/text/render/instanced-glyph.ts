import { Matrix4 } from 'three'
import { InstancedGlyphGroup } from './instanced-glyph-group.js'
import { Color as ColorRepresentation } from '@react-three/fiber'
import { colorToBuffer } from '../../utils.js'
import { ClippingRect, defaultClippingData } from '../../clipping.js'
import { GlyphInfo, glyphIntoToUV } from '../font.js'

const helperMatrix1 = new Matrix4()
const helperMatrix2 = new Matrix4()

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

  constructor(
    private readonly group: InstancedGlyphGroup,
    //modifiable using update...
    private baseMatrix: Matrix4,
    private color: ColorRepresentation,
    private opacity: number,
    private clippingRect: ClippingRect | undefined,
  ) {}

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
    const { instanceClipping } = this.group
    if (this.clippingRect == null) {
      instanceClipping.set(defaultClippingData, offset)
    } else {
      this.clippingRect.toArray(instanceClipping.array, offset)
    }
    instanceClipping.addUpdateRange(offset, 16)
    instanceClipping.needsUpdate = true
  }

  updateColor(color: ColorRepresentation): void {
    this.color = color
    if (this.index == null) {
      return
    }
    colorToBuffer(this.group.instanceRGBA, this.index, color)
  }

  updateOpacity(opacity: number): void {
    this.opacity = opacity
    if (this.index == null) {
      return
    }
    const { instanceRGBA } = this.group
    const bufferIndex = this.index * 4 + 3
    instanceRGBA.array[bufferIndex] = opacity
    instanceRGBA.addUpdateRange(bufferIndex, 1)
    instanceRGBA.needsUpdate = true
  }

  updateGlyphAndTransformation(glyphInfo: GlyphInfo, x: number, y: number, fontSize: number): void {
    if (this.glyphInfo === this.glyphInfo && this.x === x && this.y === y && this.fontSize === fontSize) {
      return
    }
    if (this.glyphInfo != glyphInfo) {
      this.glyphInfo = glyphInfo
      this.writeUV()
    }
    this.x = x
    this.y = y
    this.fontSize = fontSize
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
    const { instanceUV } = this.group
    glyphIntoToUV(this.glyphInfo, instanceUV.array, offset)
    instanceUV.addUpdateRange(offset, 4)
    instanceUV.needsUpdate = true
  }

  private writeUpdatedMatrix(): void {
    if (this.index == null || this.glyphInfo == null) {
      return
    }
    const offset = this.index * 16
    const { instanceMatrix } = this.group
    instanceMatrix.addUpdateRange(offset, 16)
    helperMatrix1
      .makeTranslation(this.x, this.y, 0)
      .multiply(helperMatrix2.makeScale(this.fontSize * this.glyphInfo.width, this.fontSize * this.glyphInfo.height, 1))
      .premultiply(this.baseMatrix)
    helperMatrix1.toArray(instanceMatrix.array, offset)
    instanceMatrix.needsUpdate = true
  }
}
