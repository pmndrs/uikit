import {
  getGlyphLayoutHeight,
  getGlyphOffsetX,
  getGlyphOffsetY,
  getKerningOffset,
  getOffsetToNextGlyph,
  getOffsetToNextLine,
} from '../utils.js'
import { alignmentXMap, alignmentYMap } from '../../utils.js'
import { buildGlyphLayout } from './measure.js'
import type {
  GlyphLayout,
  GlyphOutProperties,
  PositionedGlyphLayout,
  PositionedGlyphLayoutEntry,
  PositionedGlyphLayoutLine,
} from './types.js'

export function buildPositionedGlyphLayout(
  properties: GlyphOutProperties,
  availableWidth: number,
  availableHeight: number,
  textAlign: keyof typeof alignmentXMap | 'justify',
  verticalAlign: keyof typeof alignmentYMap,
): PositionedGlyphLayout {
  const layout = buildGlyphLayout(properties, availableWidth, availableHeight)
  const positionedLines: Array<PositionedGlyphLayoutLine> = []
  const { font, fontSize, letterSpacing = 0, lineHeight = 1.2, text } = layout
  const whitespaceWidth = getWhitespaceWidth(layout)
  let y = getTextYOffset(layout, verticalAlign) - availableHeight / 2

  for (let lineIndex = 0; lineIndex < layout.lines.length; lineIndex++) {
    const line = layout.lines[lineIndex]!
    const entries: Array<PositionedGlyphLayoutEntry> = []
    let offsetPerWhitespace =
      textAlign === 'justify' && line.whitespacesBetween > 0
        ? (availableWidth - line.nonWhitespaceWidth) / line.whitespacesBetween
        : 0
    let x = getTextXOffset(availableWidth, line.nonWhitespaceWidth, textAlign) - availableWidth / 2
    let prevGlyphId: number | undefined

    for (let charIndex = line.charIndexOffset; charIndex < line.charIndexOffset + line.charLength; charIndex++) {
      const char = text[charIndex]!
      const glyphInfo = font.getGlyphInfo(char)
      x += getKerningOffset(font, fontSize, prevGlyphId, glyphInfo)
      prevGlyphId = glyphInfo.id

      if (char === ' ' || charIndex > line.nonWhitespaceCharLength + line.charIndexOffset) {
        entries.push({
          type: 'whitespace',
          charIndex,
          x: x + getGlyphOffsetX(glyphInfo, fontSize),
          width: whitespaceWidth,
        })
        x += offsetPerWhitespace + getOffsetToNextGlyph(fontSize, glyphInfo, letterSpacing)
        continue
      }

      entries.push({
        type: 'glyph',
        charIndex,
        char,
        glyphInfo,
        x: x + getGlyphOffsetX(glyphInfo, fontSize),
        y: -(y + getGlyphOffsetY(fontSize, lineHeight, glyphInfo)),
        width: glyphInfo.width * fontSize,
      })
      x += getOffsetToNextGlyph(fontSize, glyphInfo, letterSpacing)
    }

    positionedLines.push({ ...line, entries })
    y += getOffsetToNextLine(lineHeight)
  }

  return {
    ...layout,
    lines: positionedLines,
    textAlign,
    verticalAlign,
  }
}

export function getTextXOffset(
  availableWidth: number,
  nonWhitespaceWidth: number,
  textAlign: keyof typeof alignmentXMap | 'justify',
) {
  switch (textAlign) {
    case 'right':
      return availableWidth - nonWhitespaceWidth
    case 'center':
      return (availableWidth - nonWhitespaceWidth) / 2
    default:
      return 0
  }
}

export function getTextYOffset(
  layout: Pick<GlyphLayout, 'availableHeight' | 'lines' | 'lineHeight'>,
  verticalAlign: keyof typeof alignmentYMap,
) {
  switch (verticalAlign) {
    case 'center':
    case 'middle':
      return (layout.availableHeight - getGlyphLayoutHeight(layout.lines.length, layout.lineHeight)) / 2
    case 'bottom':
      return layout.availableHeight - getGlyphLayoutHeight(layout.lines.length, layout.lineHeight)
    default:
      return 0
  }
}

export function getWhitespaceWidth({ font, fontSize }: GlyphOutProperties): number {
  return font.getGlyphInfo(' ').xadvance * fontSize
}
