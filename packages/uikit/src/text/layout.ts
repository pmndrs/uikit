import { BreakallWrapper, NowrapWrapper, WordWrapper } from './wrapper/index.js'
import { Font } from './font.js'
import { getGlyphLayoutHeight, toAbsoluteNumber } from './utils.js'
import { Signal, computed } from '@preact/signals-core'
import { MeasureMode } from 'yoga-layout/load'
import { Properties } from '../properties/index.js'
import { CustomLayouting } from '../flex/index.js'
import { TextOutProperties } from '../components/text.js'

export type GlyphLayoutLine = {
  charIndexOffset: number
  charLength: number
  nonWhitespaceCharLength: number
  nonWhitespaceWidth: number
  whitespacesBetween: number
}

export type GlyphLayout = {
  lines: Array<GlyphLayoutLine>
  availableWidth: number
  availableHeight: number
} & GlyphOutProperties

export type GlyphProperties = Partial<{
  letterSpacing: number | string
  lineHeight: number | string
  fontSize: number | string
  wordBreak: WordBreak
}>

export type WordBreak = keyof typeof wrappers

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

export type GlyphOutProperties = {
  text: string
  font: Font
  letterSpacing: number
  lineHeight: number
  fontSize: number
  wordBreak: WordBreak
}

export function computedCustomLayouting(
  properties: Properties<TextOutProperties>,
  fontSignal: Signal<Font | undefined>,
  propertiesRef: { current: GlyphOutProperties | undefined },
) {
  return computed<CustomLayouting | undefined>(() => {
    const font = fontSignal.value
    if (font == null) {
      return undefined
    }
    const textProperty = properties.value.text
    let text = Array.isArray(textProperty) ? textProperty.join('') : (textProperty ?? '')
    //TODO: tab should be intergrated into the text layouting algorithm
    text = text.replaceAll('\t', ' '.repeat(4))
    const layoutProperties = buildGlyphOutProperties(font, text, properties.value)
    propertiesRef.current = layoutProperties

    const { width: minWidth } = measureGlyphLayout(layoutProperties, 0)
    const { height: minHeight } = measureGlyphLayout(layoutProperties, undefined)

    return {
      minHeight,
      minWidth,
      measure: (width, widthMode) =>
        measureGlyphLayout(layoutProperties, widthMode === MeasureMode.Undefined ? undefined : width),
    }
  })
}

const wrappers = {
  'keep-all': NowrapWrapper,
  'break-all': BreakallWrapper,
  'break-word': WordWrapper,
}

const lineHelper = {} as GlyphLayoutLine

export function measureGlyphLayout(
  properties: GlyphOutProperties,
  availableWidth?: number,
): {
  width: number
  height: number
} {
  const wrapper = wrappers[properties.wordBreak]
  const text = properties.text

  let width = 0
  let lines = 0
  let charIndex = 0

  while (charIndex < text.length) {
    wrapper(properties, availableWidth, charIndex, lineHelper)
    width = Math.max(width, lineHelper.nonWhitespaceWidth)
    lines += 1
    charIndex = lineHelper.charLength + lineHelper.charIndexOffset
  }

  if (text[text.length - 1] === '\n') {
    lines += 1
  }

  return { width, height: getGlyphLayoutHeight(lines, properties.lineHeight) }
}

export function buildGlyphLayout(
  properties: GlyphOutProperties,
  availableWidth: number,
  availableHeight: number,
): GlyphLayout {
  const lines: Array<GlyphLayoutLine> = []
  const wrapper = wrappers[properties.wordBreak]
  const text = properties.text

  let charIndex = 0

  while (charIndex < text.length) {
    const line = {} as GlyphLayoutLine
    wrapper(properties, availableWidth, charIndex, line)
    lines.push(line)
    charIndex = line.charLength + line.charIndexOffset
  }

  if (lines.length === 0 || text[text.length - 1] === '\n') {
    lines.push({
      charLength: 0,
      nonWhitespaceWidth: 0,
      whitespacesBetween: 0,
      charIndexOffset: text.length,
      nonWhitespaceCharLength: 0,
    })
  }

  return {
    lines,
    availableHeight,
    availableWidth,
    ...properties,
  }
}
