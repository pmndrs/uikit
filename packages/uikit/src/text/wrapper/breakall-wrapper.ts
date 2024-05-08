import { getOffsetToNextGlyph } from '../utils.js'
import { GlyphWrapper, skipWhitespace } from './index.js'

export const BreakallWrapper: GlyphWrapper = (
  { text, fontSize, font, letterSpacing },
  availableWidth,
  charIndex,
  target,
) => {
  charIndex = skipWhitespace(text, charIndex)
  const firstIndex = charIndex
  target.charIndexOffset = firstIndex
  target.nonWhitespaceCharLength = 0
  target.charLength = 0
  target.nonWhitespaceWidth = 0
  target.whitespacesBetween = 0

  let position = 0
  let whitespaces = 0

  for (; charIndex < text.length; charIndex++) {
    const char = text[charIndex]
    if (char === '\n') {
      target.charLength = charIndex - firstIndex + 1
      return
    }

    position += getOffsetToNextGlyph(fontSize, font.getGlyphInfo(char), letterSpacing)

    if (char === ' ') {
      whitespaces += 1
      continue
    }

    //non whitespace
    if (target.nonWhitespaceWidth > 0 && availableWidth != null && position > availableWidth) {
      break
    }

    target.nonWhitespaceCharLength = charIndex - firstIndex + 1
    target.nonWhitespaceWidth = position
    target.whitespacesBetween = whitespaces
  }

  //not "+1" because we break when we want to remove the last one
  target.charLength = charIndex - firstIndex
}
