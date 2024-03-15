import { GlyphLayout, GlyphLayoutProperties } from './layout.js'
import { Font, GlyphInfo } from './font.js'

export function getGlyphOffsetX(
  font: Font,
  fontSize: number,
  glyphInfo: GlyphInfo,
  prevGlyphId: number | undefined,
): number {
  const kerning = prevGlyphId == null ? 0 : font.getKerning(prevGlyphId, glyphInfo.id)
  return (kerning + glyphInfo.xoffset) * fontSize
}

export function getGlyphOffsetY(fontSize: number, lineHeight: number, glyphInfo?: GlyphInfo): number {
  //glyphInfo undefined for the caret, which has no yoffset
  return ((glyphInfo?.yoffset ?? 0) + (lineHeight - 1) / 2) * fontSize
}

export function getOffsetToNextGlyph(fontSize: number, glyphInfo: GlyphInfo, letterSpacing: number): number {
  return glyphInfo.xadvance * fontSize + letterSpacing
}

export function getOffsetToNextLine(lineHeight: number, fontSize: number): number {
  return lineHeight * fontSize
}

export function getGlyphLayoutWidth(layout: GlyphLayout): number {
  return Math.max(...layout.lines.map(({ nonWhitespaceWidth }) => nonWhitespaceWidth))
}

export function getGlyphLayoutHeight(linesAmount: number, { lineHeight, fontSize }: GlyphLayoutProperties): number {
  return Math.max(linesAmount, 1) * fontSize * lineHeight
}
