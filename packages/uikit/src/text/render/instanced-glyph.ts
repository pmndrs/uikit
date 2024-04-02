import { Matrix4, WebGLRenderer } from 'three'
import { GlyphGroupManager, InstancedGlyphGroup } from './instanced-glyph-group.js'
import { ColorRepresentation, Subscriptions, colorToBuffer } from '../../utils.js'
import { ClippingRect, defaultClippingData } from '../../clipping.js'
import { FontFamilies, FontFamilyProperties, GlyphInfo, computeFont, glyphIntoToUV } from '../font.js'
import { Signal, ReadonlySignal, signal, effect } from '@preact/signals-core'
import { FlexNode } from '../../flex/node.js'
import { OrderInfo } from '../../order.js'
import { createGetBatchedProperties } from '../../properties/batched.js'
import { MergedProperties } from '../../properties/merged.js'
import { GlyphLayoutProperties, GlyphLayout, buildGlyphLayout, computeMeasureFunc } from '../layout.js'
import { TextAlignProperties, TextAppearanceProperties, InstancedText } from './instanced-text.js'

const helperMatrix1 = new Matrix4()
const helperMatrix2 = new Matrix4()

const alignPropertyKeys = ['horizontalAlign', 'verticalAlign']
const appearancePropertyKeys = ['color', 'opacity']

export type InstancedTextProperties = TextAlignProperties &
  TextAppearanceProperties &
  Omit<GlyphLayoutProperties, 'text'> &
  FontFamilyProperties

export function createInstancedText(
  properties: Signal<MergedProperties>,
  text: string | ReadonlySignal<string> | Array<string | ReadonlySignal<string>>,
  matrix: Signal<Matrix4 | undefined>,
  node: FlexNode,
  isHidden: Signal<boolean> | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: OrderInfo,
  fontFamilies: FontFamilies | undefined,
  renderer: WebGLRenderer,
  glyphGroupManager: GlyphGroupManager,
  subscriptions: Subscriptions,
) {
  const fontSignal = computeFont(properties, fontFamilies, renderer, subscriptions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const textSignal = signal<string | Signal<string> | Array<string | Signal<string>>>(text)
  let layoutPropertiesRef: { current: GlyphLayoutProperties | undefined } = { current: undefined }

  const measureFunc = computeMeasureFunc(properties, fontSignal, textSignal, layoutPropertiesRef)

  const getAlign = createGetBatchedProperties(properties, alignPropertyKeys)
  const getAppearance = createGetBatchedProperties(properties, appearancePropertyKeys)

  const layoutSignal = signal<GlyphLayout | undefined>(undefined)
  subscriptions.push(
    node.addLayoutChangeListener(() => {
      const layoutProperties = layoutPropertiesRef.current
      if (layoutProperties == null) {
        return
      }
      const { size, paddingInset, borderInset } = node
      const [width, height] = size.value
      const [pTop, pRight, pBottom, pLeft] = paddingInset.value
      const [bTop, bRight, bBottom, bLeft] = borderInset.value
      const actualWidth = width - pRight - pLeft - bRight - bLeft
      const actualheight = height - pTop - pBottom - bTop - bBottom
      layoutSignal.value = buildGlyphLayout(layoutProperties, actualWidth, actualheight)
    }),
  )

  subscriptions.push(
    effect(() => {
      const font = fontSignal.value
      if (font == null) {
        return
      }
      const instancedText = new InstancedText(
        glyphGroupManager.getGroup(orderInfo.majorIndex, font),
        getAlign,
        getAppearance,
        layoutSignal,
        matrix,
        isHidden,
        parentClippingRect,
      )
      return () => instancedText.destroy()
    }),
  )

  return measureFunc
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
    const { instanceUV } = this.group
    glyphIntoToUV(this.glyphInfo, instanceUV.array, offset)
    instanceUV.addUpdateRange(offset, 4)
    instanceUV.needsUpdate = true
  }

  private writeUpdatedMatrix(): void {
    if (this.index == null || this.glyphInfo == null || this.baseMatrix == null) {
      return
    }
    const offset = this.index * 16
    const { instanceMatrix } = this.group
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
  }
}
