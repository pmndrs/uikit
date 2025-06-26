import { GlyphLayout, GlyphLayoutProperties } from './layout.js'
import { Font, GlyphInfo } from './font.js'
import { numberWithUnitRegex } from '../utils.js'
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

export function toAbsoluteNumber(value: number | string, getRelativeValue?: () => number, root?: RootContext): number {
  if (typeof value === 'number') {
    return value
  }
  const result = value.match(numberWithUnitRegex)
  if (result == null) {
    throw new Error(`invalid value "${value}"`)
  }
  const number = parseFloat(result[1]!)
  if (result[2] === '%') {
    if (getRelativeValue == null) {
      throw new Error(`"%" values not supported for this property`)
    }
    return (getRelativeValue() * number) / 100
  }
  if (result[2] == null) {
    return number
  }
  if (root == null) {
    throw new Error(`"${result[2]}" values not supported for this property`)
  }
  switch (result[2]) {
    case 'vh':
    case 'dvh':
    case 'svh':
    case 'lvh':
      return ((root.component.size.value?.[1] ?? 0) * number) / 100
    case 'vw':
    case 'dvw':
    case 'svw':
    case 'lvw':
      return ((root.component.size.value?.[1] ?? 0) * number) / 100
  }
  throw new Error(`unknown unit "${result[2]}"`)
}

function computeLineHeight(lineHeight: number | string, fontSize: number) {
  if (typeof lineHeight === 'string' && lineHeight.endsWith('px')) {
    return parseFloat(lineHeight)
  }
  return fontSize * toAbsoluteNumber(lineHeight, () => 1)
}

export function getGlyphOffsetY(
  fontSize: number,
  lineHeight: GlyphLayoutProperties['lineHeight'],
  glyphInfo?: GlyphInfo,
): number {
  //glyphInfo undefined for the caret, which has no yoffset
  return (glyphInfo?.yoffset ?? 0) * fontSize + (computeLineHeight(lineHeight, fontSize) - fontSize) / 2
}

export function getOffsetToNextGlyph(fontSize: number, glyphInfo: GlyphInfo, letterSpacing: number): number {
  return glyphInfo.xadvance * fontSize + letterSpacing
}

export function getOffsetToNextLine(lineHeight: GlyphLayoutProperties['lineHeight'], fontSize: number): number {
  return computeLineHeight(lineHeight, fontSize)
}

export function getGlyphLayoutWidth(layout: GlyphLayout): number {
  return Math.max(...layout.lines.map(({ nonWhitespaceWidth }) => nonWhitespaceWidth))
}

export function getGlyphLayoutHeight(linesAmount: number, { lineHeight, fontSize }: GlyphLayoutProperties): number {
  return Math.max(linesAmount, 1) * computeLineHeight(lineHeight, fontSize)
}
