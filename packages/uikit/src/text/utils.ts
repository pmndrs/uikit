import { GlyphLayout } from './layout/index.js'
import { Font, GlyphInfo } from './font.js'
import { RootContext } from '../context.js'
import { parseAbsoluteNumber } from '../properties/values.js'

export function getGlyphOffsetX(glyphInfo: GlyphInfo, fontSize: number): number {
  return glyphInfo.xoffset * fontSize
}

export function getKerningOffset(
  font: Font,
  fontSize: number,
  prevGlyphId: number | undefined,
  glyphInfo: GlyphInfo,
): number {
  if (prevGlyphId == null) return 0
  return font.getKerning(prevGlyphId, glyphInfo.id) * fontSize
}

export function toAbsoluteNumber(value: number | string, getRelativeValue?: () => number, root?: RootContext): number {
  const [width, height] = root?.component.size.value ?? []
  return parseAbsoluteNumber(value, getRelativeValue, width, height)
}

export function getGlyphOffsetY(fontSize: number, lineHeight: number, glyphInfo?: GlyphInfo): number {
  //glyphInfo undefined for the caret, which has no yoffset
  return (glyphInfo?.yoffset ?? 0) * fontSize + (lineHeight - fontSize) / 2
}

export function getOffsetToNextGlyph(fontSize: number, glyphInfo: GlyphInfo, letterSpacing: number): number {
  return glyphInfo.xadvance * fontSize + letterSpacing
}

export function getOffsetToNextLine(lineHeight: number): number {
  return lineHeight
}

export function getGlyphLayoutWidth(layout: GlyphLayout): number {
  return Math.max(...layout.lines.map(({ nonWhitespaceWidth }) => nonWhitespaceWidth))
}

export function getGlyphLayoutHeight(linesAmount: number, lineHeight: number): number {
  return Math.max(linesAmount, 1) * lineHeight
}
