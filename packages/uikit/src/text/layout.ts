import { BreakallWrapper, NowrapWrapper, WordWrapper } from './wrapper/index.js'
import { Font } from './font.js'
import { getGlyphLayoutHeight } from './utils.js'
import { Signal, computed } from '@preact/signals-core'
import { MeasureFunction, MeasureMode } from 'yoga-layout/load'
import { MergedProperties } from '../properties/merged.js'
import { readReactive } from '../utils.js'
import { computedProperty } from '../properties/index.js'

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
} & GlyphLayoutProperties

export type GlyphProperties = Partial<Omit<GlyphLayoutProperties, 'text' | 'font'>>

export type GlyphLayoutProperties = {
  text: string
  font: Font
  letterSpacing: number
  lineHeight: number | `${number}%`
  fontSize: number
  wordBreak: keyof typeof wrappers
}

const defaultWordBreak: keyof typeof wrappers = 'break-word'

export function computedMeasureFunc(
  properties: Signal<MergedProperties>,
  fontSignal: Signal<Font | undefined>,
  textSignal: Signal<string | Signal<string> | Array<Signal<string> | string>>,
  propertiesRef: { current: GlyphLayoutProperties | undefined },
) {
  const fontSize = computedProperty(properties, 'fontSize', 16)
  const letterSpacing = computedProperty(properties, 'letterSpacing', 0)
  const lineHeight = computedProperty<number | `${number}%`>(properties, 'lineHeight', '120%')
  const wordBreak = computedProperty(properties, 'wordBreak', defaultWordBreak)
  return computed<MeasureFunction | undefined>(() => {
    const font = fontSignal.value
    if (font == null) {
      return undefined
    }
    const text = textSignal.value
    const layoutProperties: GlyphLayoutProperties = {
      font,
      fontSize: fontSize.value,
      letterSpacing: letterSpacing.value,
      lineHeight: lineHeight.value,
      text: Array.isArray(text) ? text.map((t) => readReactive(t)).join('') : readReactive(text),
      wordBreak: wordBreak.value,
    }
    propertiesRef.current = layoutProperties

    return (width, widthMode) =>
      measureGlyphLayout(layoutProperties, widthMode === MeasureMode.Undefined ? undefined : width)
  })
}

const wrappers = {
  'keep-all': NowrapWrapper,
  'break-all': BreakallWrapper,
  'break-word': WordWrapper,
}

const lineHelper = {} as GlyphLayoutLine

export function measureGlyphLayout(
  properties: GlyphLayoutProperties,
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

  return { width, height: getGlyphLayoutHeight(lines, properties) }
}

export function buildGlyphLayout(
  properties: GlyphLayoutProperties,
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
