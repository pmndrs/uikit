import { effect } from '@preact/signals-core'
import type { ReadonlySignal } from '@preact/signals-core'
import { InstancedGlyph } from './instanced-glyph.js'
import { Matrix4 } from 'three'
import { ClippingRect } from '../../clipping.js'
import { abortableEffect, alignmentXMap, alignmentYMap } from '../../utils.js'
import { toAbsoluteNumber } from '../utils.js'
import { InstancedGlyphGroup } from './instanced-glyph-group.js'
import type { PositionedGlyphLayout } from '../layout/index.js'
import type { BaseOutProperties, Properties } from '../../properties/index.js'
import type { Font } from '../font.js'
import type { OrderInfo } from '../../order.js'
import type { RootContext } from '../../context.js'

export type TextAlignProperties = {
  textAlign?: keyof typeof alignmentXMap | 'justify'
}

export const additionalTextDefaults = {
  verticalAlign: 'middle' as keyof typeof alignmentYMap,
}

export type AdditionalTextDefaults = typeof additionalTextDefaults

type InstancedTextProperties = AdditionalTextDefaults & BaseOutProperties

export type InstancedTextTarget<OutProperties extends InstancedTextProperties = InstancedTextProperties> = {
  root: ReadonlySignal<RootContext>
  fontSignal: ReadonlySignal<Font | undefined>
  orderInfo: ReadonlySignal<OrderInfo | undefined>
  properties: Properties<OutProperties>
  globalTextMatrix: ReadonlySignal<Matrix4 | undefined>
  isVisible: ReadonlySignal<boolean>
  abortSignal: AbortSignal
}

export function createInstancedText<OutProperties extends InstancedTextProperties>(
  text: InstancedTextTarget<OutProperties>,
  parentClippingRect: ReadonlySignal<ClippingRect | undefined> | undefined,
  layoutSignal: ReadonlySignal<PositionedGlyphLayout | undefined>,
): void {
  abortableEffect(() => {
    const font = text.fontSignal.value
    const orderInfo = text.orderInfo.value
    if (font == null || orderInfo == null) {
      return
    }
    const instancedText = new InstancedText(
      text.root.value.glyphGroupManager.getGroup(
        orderInfo,
        text.properties.value.depthTest,
        text.properties.value.depthWrite ?? false,
        text.properties.value.renderOrder,
        font,
      ),
      text.properties,
      layoutSignal,
      text.globalTextMatrix,
      text.isVisible,
      parentClippingRect,
    )
    return () => instancedText.destroy()
  }, text.abortSignal)
}

export class InstancedText {
  private glyphLines: Array<Array<InstancedGlyph | number>> = []

  private unsubscribeInitialList: Array<() => void> = []

  private unsubscribeShowList: Array<() => void> = []

  constructor(
    private group: InstancedGlyphGroup,
    private properties: Properties<InstancedTextProperties>,
    private layoutSignal: ReadonlySignal<PositionedGlyphLayout | undefined>,
    private matrix: ReadonlySignal<Matrix4 | undefined>,
    isVisible: ReadonlySignal<boolean>,
    private parentClippingRect: ReadonlySignal<ClippingRect | undefined> | undefined,
  ) {
    this.unsubscribeInitialList = [
      effect(() => {
        if (!isVisible.value || toAbsoluteNumber(this.properties.value.opacity, () => 1) < 0.01) {
          this.hide()
          return
        }
        this.show()
      }),
    ]
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
        const color = this.properties.value.color
        const opacity = toAbsoluteNumber(this.properties.value.opacity, () => 1)
        traverseGlyphs(this.glyphLines, (glyph) => glyph.updateColor(color ?? 0, opacity))
      }),
      effect(() => {
        const layout = this.layoutSignal.value
        if (layout == null) {
          return
        }
        const { lines, fontSize = 16 } = layout

        const linesLength = lines.length
        const pixelSize = this.properties.value.pixelSize
        for (let lineIndex = 0; lineIndex < linesLength; lineIndex++) {
          if (lineIndex === this.glyphLines.length) {
            this.glyphLines.push([])
          }

          const { entries } = lines[lineIndex]!
          const glyphs = this.glyphLines[lineIndex]!

          for (let glyphIndex = 0; glyphIndex < entries.length; glyphIndex++) {
            const entry = entries[glyphIndex]!
            if (entry.type === 'whitespace') {
              if (typeof glyphs[glyphIndex] === 'number') {
                glyphs[glyphIndex] = entry.x
              } else {
                glyphs.splice(glyphIndex, 0, entry.x)
              }
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
                this.properties.peek().color ?? 0,
                toAbsoluteNumber(this.properties.peek().opacity, () => 1),
                this.parentClippingRect?.peek(),
              )
            }
            glyph.updateGlyphAndTransformation(entry.glyphInfo, entry.x, entry.y, fontSize, pixelSize)
            glyph.show()
          }

          //remove unnecassary glyphs
          const glyphsLength = glyphs.length
          const newGlyphsLength = entries.length
          for (let ii = newGlyphsLength; ii < glyphsLength; ii++) {
            const glyph = glyphs[ii]!
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
      }),
    )
  }

  private hide() {
    const unsubscribeListLength = this.unsubscribeShowList.length
    if (unsubscribeListLength === 0) {
      return
    }
    for (let i = 0; i < unsubscribeListLength; i++) {
      this.unsubscribeShowList[i]!()
    }
    this.unsubscribeShowList.length = 0
    traverseGlyphs(this.glyphLines, (glyph) => glyph.hide())
  }

  destroy(): void {
    this.hide()
    this.glyphLines.length = 0
    const length = this.unsubscribeInitialList.length
    for (let i = 0; i < length; i++) {
      this.unsubscribeInitialList[i]!()
    }
  }
}

function traverseGlyphs(
  glyphLines: Array<Array<InstancedGlyph | number>>,
  fn: (glyph: InstancedGlyph) => void,
  offset: number = 0,
): void {
  const glyphLinesLength = glyphLines.length
  for (let i = offset; i < glyphLinesLength; i++) {
    const glyphs = glyphLines[i]!
    const glyphsLength = glyphs.length
    for (let ii = 0; ii < glyphsLength; ii++) {
      const glyph = glyphs[ii]!
      if (typeof glyph == 'number') {
        continue
      }
      fn(glyph)
    }
  }
}
