import { GlyphLayoutLine } from '../layout.js'
import { getOffsetToNextGlyph } from '../utils.js'
import { GlyphWrapper } from './index.js'

export const BreakallWrapper: GlyphWrapper = ({ text, fontSize, font, letterSpacing }, availableWidth, start) => {
  let result: GlyphLayoutLine = {
    start,
    end: start,
    whitespaces: 0,
    width: 0,
  }

  let textIndex = start
  let position = 0
  let whitespaces = 0
  while (textIndex < text.length) {
    const char = text[textIndex]
    if (char === '\n') {
      break
    }
    const offset = getOffsetToNextGlyph(fontSize, font.getGlyphInfo(char), letterSpacing)
    if (availableWidth != null && position + offset > availableWidth) {
      break
    }

    position += offset
    ++textIndex

    if (char === ' ') {
      whitespaces += 1
    } else {
      result.width = position
      result.end = textIndex
      result.whitespaces = whitespaces
    }
  }
  return result
}
