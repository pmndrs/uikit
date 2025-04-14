import { Signal, effect, signal } from '@preact/signals-core'
import { InstancedGlyph } from './instanced-glyph.js'
import { Matrix4, Vector2Tuple } from 'three'
import { ClippingRect } from '../../clipping.js'
import { ColorRepresentation, abortableEffect, alignmentXMap, alignmentYMap } from '../../utils.js'
import {
  getGlyphLayoutHeight,
  getGlyphOffsetX,
  getGlyphOffsetY,
  getOffsetToNextGlyph,
  getOffsetToNextLine,
} from '../utils.js'
import { GlyphGroupManager, InstancedGlyphGroup } from './instanced-glyph-group.js'
import { GlyphLayout, GlyphLayoutProperties, buildGlyphLayout, computedCustomLayouting } from '../layout.js'
import { SelectionTransformation } from '../../selection.js'
import { OrderInfo } from '../../order.js'
import { Font } from '../font.js'
import { MergedProperties, computedInheritableProperty } from '../../properties/index.js'
import { FlexNode, FlexNodeState } from '../../flex/index.js'
import { CaretTransformation } from '../../caret.js'

export type TextAlignProperties = {
  textAlign?: keyof typeof alignmentXMap | 'block'
  verticalAlign?: keyof typeof alignmentYMap
}

export type TextAppearanceProperties = {
  color?: ColorRepresentation
  opacity?: number
}

const defaultVerticalAlign: keyof typeof alignmentYMap = 'middle'
const defaulttextAlign: keyof typeof alignmentXMap | 'block' = 'left'

export function createInstancedText(
  properties: Signal<MergedProperties>,
  textSignal: Signal<unknown | Signal<unknown> | Array<unknown | Signal<unknown>>>,
  matrix: Signal<Matrix4 | undefined>,
  node: Signal<FlexNode | undefined>,
  flexState: FlexNodeState,
  isVisible: Signal<boolean>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo | undefined>,
  fontSignal: Signal<Font | undefined>,
  glyphGroupManager: GlyphGroupManager,
  selectionRange: Signal<Vector2Tuple | undefined> | undefined,
  selectionTransformations: Signal<Array<SelectionTransformation>> | undefined,
  caretTransformation: Signal<CaretTransformation | undefined> | undefined,
  instancedTextRef: { current?: InstancedText } | undefined,
  defaultWordBreak: GlyphLayoutProperties['wordBreak'],
  abortSignal: AbortSignal,
) {
  let layoutPropertiesRef: { current: GlyphLayoutProperties | undefined } = { current: undefined }

  const customLayouting = computedCustomLayouting(
    properties,
    fontSignal,
    textSignal,
    layoutPropertiesRef,
    defaultWordBreak,
  )
  const verticalAlign = computedInheritableProperty(properties, 'verticalAlign', defaultVerticalAlign)
  const textAlign = computedInheritableProperty(properties, 'textAlign', defaulttextAlign)
  const color = computedInheritableProperty(properties, 'color', 0x0)
  const opacity = computedInheritableProperty(properties, 'opacity', 1)

  const layoutSignal = signal<GlyphLayout | undefined>(undefined)
  abortableEffect(
    () =>
      node.value?.addLayoutChangeListener(() => {
        const layoutProperties = layoutPropertiesRef.current
        const {
          size: { value: size },
          paddingInset: { value: paddingInset },
          borderInset: { value: borderInset },
        } = flexState
        if (layoutProperties == null || size == null || paddingInset == null || borderInset == null) {
          return
        }
        const [width, height] = size
        const [pTop, pRight, pBottom, pLeft] = paddingInset
        const [bTop, bRight, bBottom, bLeft] = borderInset
        const actualWidth = width - pRight - pLeft - bRight - bLeft
        const actualheight = height - pTop - pBottom - bTop - bBottom
        layoutSignal.value = buildGlyphLayout(layoutProperties, actualWidth, actualheight)
      }),
    abortSignal,
  )
  abortableEffect(() => {
    const font = fontSignal.value
    if (font == null || orderInfo.value == null) {
      return
    }
    const instancedText = new InstancedText(
      glyphGroupManager.getGroup(
        orderInfo.value.majorIndex,
        properties.value.read('depthTest', true),
        properties.value.read('depthWrite', false),
        properties.value.read('renderOrder', 0),
        font,
      ),
      textAlign,
      verticalAlign,
      color,
      opacity,
      layoutSignal,
      matrix,
      isVisible,
      parentClippingRect,
      selectionRange,
      selectionTransformations,
      caretTransformation,
    )
    if (instancedTextRef != null) {
      instancedTextRef.current = instancedText
    }
    return () => instancedText.destroy()
  }, abortSignal)

  return customLayouting
}

const noSelectionTransformations: Array<SelectionTransformation> = []

export class InstancedText {
  private glyphLines: Array<Array<InstancedGlyph | number>> = []
  private lastLayout: GlyphLayout | undefined

  private unsubscribeInitialList: Array<() => void> = []

  private unsubscribeShowList: Array<() => void> = []

  constructor(
    private group: InstancedGlyphGroup,
    private textAlign: Signal<keyof typeof alignmentXMap | 'block'>,
    private verticalAlign: Signal<keyof typeof alignmentYMap>,
    private color: Signal<ColorRepresentation>,
    private opacity: Signal<number>,
    private layoutSignal: Signal<GlyphLayout | undefined>,
    private matrix: Signal<Matrix4 | undefined>,
    isVisible: Signal<boolean>,
    private parentClippingRect: Signal<ClippingRect | undefined> | undefined,
    private selectionRange: Signal<Vector2Tuple | undefined> | undefined,
    private selectionTransformations: Signal<Array<SelectionTransformation>> | undefined,
    private caretTransformation: Signal<CaretTransformation | undefined> | undefined,
  ) {
    this.unsubscribeInitialList = [
      effect(() => {
        if (!isVisible.value || opacity.value < 0.01) {
          this.hide()
          return
        }
        this.show()
      }),
      effect(() =>
        this.updateSelectionBoxes(this.lastLayout, selectionRange?.value, verticalAlign.peek(), textAlign.peek()),
      ),
    ]
  }

  public getCharIndex(x: number, y: number, position: 'between' | 'on'): number {
    const layout = this.lastLayout
    if (layout == null) {
      return 0
    }
    y -= -getYOffset(layout, this.verticalAlign.peek())
    const lineIndex = Math.floor(y / -getOffsetToNextLine(layout.lineHeight, layout.fontSize))
    const lines = layout.lines
    if (lineIndex < 0 || lines.length === 0) {
      return 0
    }
    if (lineIndex >= lines.length) {
      const lastLine = lines[lines.length - 1]
      return lastLine.charIndexOffset + lastLine.charLength + 1
    }

    const line = lines[lineIndex]
    const whitespaceWidth = layout.font.getGlyphInfo(' ').xadvance * layout.fontSize
    const glyphs = this.glyphLines[lineIndex]
    let glyphsLength = glyphs.length
    for (let i = 0; i < glyphsLength; i++) {
      const entry = glyphs[i]
      if (x < this.getGlyphX(entry, position === 'between' ? 0.5 : 1, whitespaceWidth) + layout.availableWidth / 2) {
        return i + line.charIndexOffset
      }
    }
    return line.charIndexOffset + line.charLength + 1
  }

  private updateSelectionBoxes(
    layout: GlyphLayout | undefined,
    range: Vector2Tuple | undefined,
    verticalAlign: keyof typeof alignmentYMap,
    textAlign: keyof typeof alignmentXMap | 'block',
  ): void {
    if (this.caretTransformation == null || this.selectionTransformations == null) {
      return
    }
    if (range == null || layout == null || layout.lines.length === 0) {
      this.caretTransformation.value = undefined
      this.selectionTransformations.value = noSelectionTransformations
      return
    }
    const whitespaceWidth = layout.font.getGlyphInfo(' ').xadvance * layout.fontSize
    const [startCharIndexIncl, endCharIndexExcl] = range
    if (endCharIndexExcl <= startCharIndexIncl) {
      const { lineIndex, x } = this.getGlyphLineAndX(layout, endCharIndexExcl, true, whitespaceWidth, textAlign)
      const y = -(
        getYOffset(layout, verticalAlign) -
        layout.availableHeight / 2 +
        lineIndex * getOffsetToNextLine(layout.lineHeight, layout.fontSize) +
        getGlyphOffsetY(layout.fontSize, layout.lineHeight)
      )
      this.caretTransformation.value = { position: [x, y - layout.fontSize / 2], height: layout.fontSize }
      this.selectionTransformations.value = []
      return
    }
    this.caretTransformation.value = undefined
    const start = this.getGlyphLineAndX(layout, startCharIndexIncl, true, whitespaceWidth, textAlign)
    const end = this.getGlyphLineAndX(layout, endCharIndexExcl - 1, false, whitespaceWidth, textAlign)
    if (start.lineIndex === end.lineIndex) {
      this.selectionTransformations.value = [
        this.computeSelectionTransformation(start.lineIndex, start.x, end.x, layout, verticalAlign, whitespaceWidth),
      ]
      return
    }
    const newSelectionTransformations: Array<SelectionTransformation> = [
      this.computeSelectionTransformation(start.lineIndex, start.x, undefined, layout, verticalAlign, whitespaceWidth),
    ]
    for (let i = start.lineIndex + 1; i < end.lineIndex; i++) {
      newSelectionTransformations.push(
        this.computeSelectionTransformation(i, undefined, undefined, layout, verticalAlign, whitespaceWidth),
      )
    }
    newSelectionTransformations.push(
      this.computeSelectionTransformation(end.lineIndex, undefined, end.x, layout, verticalAlign, whitespaceWidth),
    )
    this.selectionTransformations.value = newSelectionTransformations
  }

  private computeSelectionTransformation(
    lineIndex: number,
    startX: number | undefined,
    endX: number | undefined,
    layout: GlyphLayout,
    verticalAlign: keyof typeof alignmentYMap,
    whitespaceWidth: number,
  ): SelectionTransformation {
    const lineGlyphs = this.glyphLines[lineIndex]
    if (startX == null) {
      startX = this.getGlyphX(lineGlyphs[0], 0, whitespaceWidth)
    }
    if (endX == null) {
      endX = this.getGlyphX(lineGlyphs[lineGlyphs.length - 1], 1, whitespaceWidth)
    }
    const height = getOffsetToNextLine(layout.lineHeight, layout.fontSize)
    const y = -(getYOffset(layout, verticalAlign) - layout.availableHeight / 2 + lineIndex * height)
    const width = endX - startX
    return { position: [startX + width / 2, y - height / 2], size: [width, height] }
  }

  private getGlyphLineAndX(
    { lines, availableWidth }: GlyphLayout,
    charIndex: number,
    start: boolean,
    whitespaceWidth: number,
    textAlign: keyof typeof alignmentXMap | 'block',
  ): { lineIndex: number; x: number } {
    const linesLength = lines.length
    if (charIndex >= lines[0].charIndexOffset) {
      for (let lineIndex = 0; lineIndex < linesLength; lineIndex++) {
        const line = lines[lineIndex]
        if (charIndex >= line.charIndexOffset + line.charLength) {
          continue
        }
        //line found
        const glyphEntry = this.glyphLines[lineIndex][Math.max(charIndex - line.charIndexOffset, 0)]
        return { lineIndex, x: this.getGlyphX(glyphEntry, start ? 0 : 1, whitespaceWidth) }
      }
    }
    const lastLine = lines[linesLength - 1]
    if (lastLine.charLength === 0 || charIndex < lastLine.charIndexOffset) {
      return {
        lineIndex: linesLength - 1,
        x: getXOffset(availableWidth, lastLine.nonWhitespaceWidth, textAlign) - availableWidth / 2,
      }
    }
    const lastGlyphEntry = this.glyphLines[linesLength - 1][lastLine.charLength - 1]
    return { lineIndex: linesLength - 1, x: this.getGlyphX(lastGlyphEntry, 1, whitespaceWidth) }
  }

  private getGlyphX(entry: number | InstancedGlyph, widthMultiplier: number, whitespaceWidth: number) {
    if (typeof entry === 'number') {
      return entry + widthMultiplier * whitespaceWidth
    }
    return entry.getX(widthMultiplier)
  }

  private show() {
    if (this.unsubscribeShowList.length > 0) {
      return
    }
    traverseGlyphs(this.glyphLines, (glyph) => glyph.show())
    this.unsubscribeShowList.push(
      effect(() => {
        const matrix = this.matrix.value
        if (matrix == null) {
          return
        }
        traverseGlyphs(this.glyphLines, (glyph) => glyph.updateBaseMatrix(matrix))
      }),
      effect(() => {
        const clippingRect = this.parentClippingRect?.value
        traverseGlyphs(this.glyphLines, (glyph) => glyph.updateClippingRect(clippingRect))
      }),
      effect(() => {
        const color = this.color.value
        traverseGlyphs(this.glyphLines, (glyph) => glyph.updateColor(color))
      }),
      effect(() => {
        const opacity = this.opacity.value
        traverseGlyphs(this.glyphLines, (glyph) => glyph.updateOpacity(opacity))
      }),
      effect(() => {
        const layout = this.layoutSignal.value
        if (layout == null) {
          return
        }
        const { text, font, lines, letterSpacing = 0, fontSize = 16, lineHeight = 1.2, availableWidth } = layout

        let y = getYOffset(layout, this.verticalAlign.value) - layout.availableHeight / 2

        const linesLength = lines.length
        const pixelSize = this.group.root.pixelSize.value
        for (let lineIndex = 0; lineIndex < linesLength; lineIndex++) {
          if (lineIndex === this.glyphLines.length) {
            this.glyphLines.push([])
          }

          const {
            whitespacesBetween,
            nonWhitespaceWidth,
            charIndexOffset: firstNonWhitespaceCharIndex,
            nonWhitespaceCharLength,
            charLength,
          } = lines[lineIndex]

          let offsetPerWhitespace =
            this.textAlign.value === 'block' ? (availableWidth - nonWhitespaceWidth) / whitespacesBetween : 0
          let x = getXOffset(availableWidth, nonWhitespaceWidth, this.textAlign.value) - availableWidth / 2

          let prevGlyphId: number | undefined
          const glyphs = this.glyphLines[lineIndex]

          for (
            let charIndex = firstNonWhitespaceCharIndex;
            charIndex < firstNonWhitespaceCharIndex + charLength;
            charIndex++
          ) {
            const glyphIndex = charIndex - firstNonWhitespaceCharIndex
            const char = text[charIndex]
            const glyphInfo = font.getGlyphInfo(char)
            if (char === ' ' || charIndex > nonWhitespaceCharLength + firstNonWhitespaceCharIndex) {
              prevGlyphId = glyphInfo.id
              const xPosition = x + getGlyphOffsetX(font, fontSize, glyphInfo, prevGlyphId)
              if (typeof glyphs[glyphIndex] === 'number') {
                glyphs[glyphIndex] = x
              } else {
                glyphs.splice(glyphIndex, 0, xPosition)
              }
              x += offsetPerWhitespace + getOffsetToNextGlyph(fontSize, glyphInfo, letterSpacing)
              continue
            }
            //non space character
            //delete undefined entries so we find a reusable glyph
            let glyphOrNumber = glyphs[glyphIndex]
            while (glyphIndex < glyphs.length && typeof glyphOrNumber == 'number') {
              glyphs.splice(glyphIndex, 1)
              glyphOrNumber = glyphs[glyphIndex]
            }
            //the prev. loop assures that glyphOrNumber is a InstancedGlyph or undefined
            let glyph = glyphOrNumber as InstancedGlyph
            if (glyph == null) {
              //no reusable glyph found
              glyphs[glyphIndex] = glyph = new InstancedGlyph(
                this.group,
                this.matrix.peek(),
                this.color.peek(),
                this.opacity.peek(),
                this.parentClippingRect?.peek(),
              )
            }
            glyph.updateGlyphAndTransformation(
              glyphInfo,
              x + getGlyphOffsetX(font, fontSize, glyphInfo, prevGlyphId),
              -(y + getGlyphOffsetY(fontSize, lineHeight, glyphInfo)),
              fontSize,
              pixelSize,
            )
            glyph.show()
            prevGlyphId = glyphInfo.id
            x += getOffsetToNextGlyph(fontSize, glyphInfo, letterSpacing)
          }

          y += getOffsetToNextLine(lineHeight, fontSize)

          //remove unnecassary glyphs
          const glyphsLength = glyphs.length
          const newGlyphsLength = charLength
          for (let ii = newGlyphsLength; ii < glyphsLength; ii++) {
            const glyph = glyphs[ii]
            if (typeof glyph === 'number') {
              continue
            }
            glyph.hide()
          }
          glyphs.length = newGlyphsLength
        }
        //remove unnecassary glyph lines
        traverseGlyphs(this.glyphLines, (glyph) => glyph.hide(), linesLength)
        this.glyphLines.length = linesLength
        this.lastLayout = layout
        this.updateSelectionBoxes(layout, this.selectionRange?.peek(), this.verticalAlign.value, this.textAlign.value)
      }),
    )
  }

  private hide() {
    const unsubscribeListLength = this.unsubscribeShowList.length
    if (unsubscribeListLength === 0) {
      return
    }
    for (let i = 0; i < unsubscribeListLength; i++) {
      this.unsubscribeShowList[i]()
    }
    this.unsubscribeShowList.length = 0
    traverseGlyphs(this.glyphLines, (glyph) => glyph.hide())
  }

  destroy(): void {
    this.hide()
    this.glyphLines.length = 0
    const length = this.unsubscribeInitialList.length
    for (let i = 0; i < length; i++) {
      this.unsubscribeInitialList[i]()
    }
  }
}

function getXOffset(
  availableWidth: number,
  nonWhitespaceWidth: number,
  textAlign: keyof typeof alignmentXMap | 'block',
) {
  switch (textAlign) {
    case 'right':
      return availableWidth - nonWhitespaceWidth
    case 'center':
      return (availableWidth - nonWhitespaceWidth) / 2
    default:
      return 0
  }
}

function getYOffset(layout: GlyphLayout, verticalAlign: keyof typeof alignmentYMap) {
  switch (verticalAlign) {
    case 'center':
    case 'middle':
      return (layout.availableHeight - getGlyphLayoutHeight(layout.lines.length, layout)) / 2
    case 'bottom':
      return layout.availableHeight - getGlyphLayoutHeight(layout.lines.length, layout)
    default:
      return 0
  }
}

function traverseGlyphs(
  glyphLines: Array<Array<InstancedGlyph | number>>,
  fn: (glyph: InstancedGlyph) => void,
  offset: number = 0,
): void {
  const glyphLinesLength = glyphLines.length
  for (let i = offset; i < glyphLinesLength; i++) {
    const glyphs = glyphLines[i]
    const glyphsLength = glyphs.length
    for (let ii = 0; ii < glyphsLength; ii++) {
      const glyph = glyphs[ii]
      if (typeof glyph == 'number') {
        continue
      }
      fn(glyph)
    }
  }
}
