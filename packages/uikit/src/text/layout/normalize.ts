import { Signal, computed } from '@preact/signals-core'
import type { Properties } from '../../properties/index.js'
import { parseNumberLike } from '../../properties/values.js'
import type { Font } from '../font.js'
import { toAbsoluteNumber } from '../utils.js'
import type { GlyphOutProperties, GlyphProperties, TextLayoutProperties } from './types.js'

function buildGlyphOutProperties(
  font: Font,
  text: string,
  { fontSize: fontSizeString, letterSpacing, lineHeight: lineHeightString, wordBreak }: Required<GlyphProperties>,
): GlyphOutProperties {
  const fontSize = toAbsoluteNumber(fontSizeString)
  let lineHeight: number
  if (typeof lineHeightString === 'string' && lineHeightString.endsWith('px')) {
    lineHeight = parseFloat(lineHeightString)
  } else {
    lineHeight = fontSize * toAbsoluteNumber(lineHeightString, () => 1)
  }
  return { font, text, fontSize, letterSpacing: toAbsoluteNumber(letterSpacing), lineHeight, wordBreak }
}

const collapseRegex = /[\t\n ]+/gm
const preLineCollapseNonLinefeedWhitespaceRegex = /[\t ]+/g
const preLineCollapseLinefeedRegex = /[\t ]*\n[\t ]*/gm
const preLineTrimNonLinefeedWhitespaceRegex = /^[ \t]+|[ \t]+$/g

export function computedGlyphOutProperties(
  properties: Properties<TextLayoutProperties>,
  fontSignal: Signal<Font | undefined>,
) {
  return computed<GlyphOutProperties | undefined>(() => {
    const font = fontSignal.value
    if (font == null) {
      return undefined
    }
    const textProperty = properties.value.text
    let text = Array.isArray(textProperty) ? textProperty.map(toString).join('') : toString(textProperty)
    const tabSize = parseNumberLike(properties.value.tabSize)
    const whiteSpace = properties.value.whiteSpace
    switch (whiteSpace) {
      case 'pre':
        text = text.replaceAll('\t', ' '.repeat(tabSize))
        break
      case 'pre-line':
        text = text
          .replaceAll(preLineCollapseNonLinefeedWhitespaceRegex, ' ')
          .replaceAll(preLineCollapseLinefeedRegex, '\n')
          .replaceAll(preLineTrimNonLinefeedWhitespaceRegex, '')
        break
      default:
        text = text.replaceAll(collapseRegex, ' ').trim()
        break
    }
    return buildGlyphOutProperties(font, text, properties.value)
  })
}

function toString(value: unknown) {
  if (value instanceof Signal) {
    value = value.value
  }
  if (value == null) {
    return ''
  }
  return String(value)
}
