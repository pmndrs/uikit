import type { Signal } from '@preact/signals-core'
import type { Matrix4, Vector2Tuple } from 'three'
import type { GlyphInfo, Font } from '../font.js'
import type { BaseOutProperties, Properties } from '../../properties/index.js'
import type { NumberValue, LengthValue } from '../../properties/values.js'
import type { Inset } from '../../flex/node.js'
import type { alignmentXMap, alignmentYMap } from '../../utils.js'

export type GlyphLayoutLine = {
  charIndexOffset: number
  charLength: number
  nonWhitespaceCharLength: number
  nonWhitespaceWidth: number
  whitespacesBetween: number
}

export type GlyphLayout = {
  lines: Array<GlyphLayoutLine>
  availableWidth: number
  availableHeight: number
} & GlyphOutProperties

export type PositionedGlyphLayoutEntry =
  | {
      type: 'glyph'
      charIndex: number
      char: string
      glyphInfo: GlyphInfo
      x: number
      y: number
      width: number
    }
  | {
      type: 'whitespace'
      charIndex: number
      x: number
      width: number
    }

export type PositionedGlyphLayoutLine = GlyphLayoutLine & {
  entries: Array<PositionedGlyphLayoutEntry>
}

export type PositionedGlyphLayout = GlyphLayout & {
  lines: Array<PositionedGlyphLayoutLine>
  textAlign: keyof typeof alignmentXMap | 'justify'
  verticalAlign: keyof typeof alignmentYMap
}

export type CaretTransformation = {
  position: Vector2Tuple
  height: number
}

export type SelectionTransformation = {
  size: Vector2Tuple
  position: Vector2Tuple
}

export type TextLayoutProperties = BaseOutProperties & { text?: unknown }

export type TextLayoutTarget = {
  properties: Properties<TextLayoutProperties>
  fontSignal: Signal<Font | undefined>
  size: Signal<Vector2Tuple | undefined>
  paddingInset: Signal<Inset | undefined>
  borderInset: Signal<Inset | undefined>
}

export type TextMatrixTarget = {
  properties: Properties<TextLayoutProperties>
  globalMatrix: Signal<Matrix4 | undefined>
  paddingInset: Signal<Inset | undefined>
  borderInset: Signal<Inset | undefined>
}

export type GlyphProperties = Partial<{
  letterSpacing: LengthValue
  lineHeight: LengthValue
  fontSize: LengthValue
  wordBreak: WordBreak
  whiteSpace: WhiteSpace
  tabSize: NumberValue
}>

export type WhiteSpace = 'normal' | 'collapse' | 'pre' | 'pre-line'

export type WordBreak = 'keep-all' | 'break-all' | 'break-word'

export type GlyphOutProperties = {
  text: string
  font: Font
  letterSpacing: number
  lineHeight: number
  fontSize: number
  wordBreak: WordBreak
}
