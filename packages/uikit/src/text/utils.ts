import { GlyphLayout } from './layout.js'
import { Font, GlyphInfo } from './font.js'
import { RootContext } from '../context.js'

export function getGlyphOffsetX(
  font: Font,
  fontSize: number,
  glyphInfo: GlyphInfo,
  prevGlyphId: number | undefined,
): number {
  const kerning = prevGlyphId == null ? 0 : font.getKerning(prevGlyphId, glyphInfo.id)
  return (kerning + glyphInfo.xoffset) * fontSize
}

//order is important here as we need to check vh and vw last
const vhSymbols = ['dvh', 'svh', 'lvh', 'vh']
const vwSymbols = ['dvw', 'svw', 'lvw', 'vw']

export function toAbsoluteNumber(value: number | string, getRelativeValue?: () => number, root?: RootContext): number {
  if (typeof value === 'number') {
    return value
  }
  const number = parseFloat(value)
  if (isNaN(number)) {
    throw new Error(`Invalid number: ${value}`)
  }
  if (getRelativeValue != null && value.endsWith('%')) {
    return (getRelativeValue() * number) / 100
  }
  if (root != null && vhSymbols.some((symbol) => value.endsWith(symbol))) {
    return ((root.component.size.value?.[1] ?? 0) * number) / 100
  }
  if (root != null && vwSymbols.some((symbol) => value.endsWith(symbol))) {
    return ((root.component.size.value?.[1] ?? 0) * number) / 100
  }
  return number
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
