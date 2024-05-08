import { GlyphLayout, GlyphLayoutProperties } from './layout.js'
import { Font, GlyphInfo } from './font.js'
import { percentageRegex } from '../utils.js'

export function getGlyphOffsetX(
  font: Font,
  fontSize: number,
  glyphInfo: GlyphInfo,
  prevGlyphId: number | undefined,
): number {
  const kerning = prevGlyphId == null ? 0 : font.getKerning(prevGlyphId, glyphInfo.id)
  return (kerning + glyphInfo.xoffset) * fontSize
}

function lineHeightToAbsolute(lineHeight: GlyphLayoutProperties['lineHeight'], fontSize: number): number {
  if (typeof lineHeight === 'number') {
    return lineHeight
  }
  const result = percentageRegex.exec(lineHeight)
  if (result == null) {
    throw new Error(`invalid line height "${lineHeight}"`)
  }
  return (fontSize * parseFloat(result[1])) / 100
}

export function getGlyphOffsetY(
  fontSize: number,
  lineHeight: GlyphLayoutProperties['lineHeight'],
  glyphInfo?: GlyphInfo,
): number {
  //glyphInfo undefined for the caret, which has no yoffset
  return (glyphInfo?.yoffset ?? 0) * fontSize + (lineHeightToAbsolute(lineHeight, fontSize) - fontSize) / 2
}

export function getOffsetToNextGlyph(fontSize: number, glyphInfo: GlyphInfo, letterSpacing: number): number {
  return glyphInfo.xadvance * fontSize + letterSpacing
}

export function getOffsetToNextLine(lineHeight: GlyphLayoutProperties['lineHeight'], fontSize: number): number {
  return lineHeightToAbsolute(lineHeight, fontSize)
}

export function getGlyphLayoutWidth(layout: GlyphLayout): number {
  return Math.max(...layout.lines.map(({ nonWhitespaceWidth }) => nonWhitespaceWidth))
}

export function getGlyphLayoutHeight(linesAmount: number, { lineHeight, fontSize }: GlyphLayoutProperties): number {
  return Math.max(linesAmount, 1) * lineHeightToAbsolute(lineHeight, fontSize)
}
