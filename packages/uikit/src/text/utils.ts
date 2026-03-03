import { GlyphLayout } from './layout.js'
import { Font, GlyphInfo } from './font.js'
import { RootContext } from '../context.js'

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
