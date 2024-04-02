import { BreakallWrapper, NowrapWrapper, WordWrapper } from './wrapper/index.js'
import { Font } from './font.js'
import { getGlyphLayoutHeight } from './utils.js'
import { Signal, computed } from '@preact/signals-core'
import { MeasureFunction, MeasureMode } from 'yoga-layout'
import { createGetBatchedProperties } from '../properties/batched.js'
import { MergedProperties } from '../properties/merged.js'
import { readReactive } from '../utils.js'

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
  lineHeight: number
  fontSize: number
  wordBreak: keyof typeof wrappers
}

const glyphPropertyKeys = ['fontSize', 'letterSpacing', 'lineHeight', 'wordBreak'] as const

export function computedMeasureFunc(
  properties: Signal<MergedProperties>,
  fontSignal: Signal<Font | undefined>,
  textSignal: Signal<string | Signal<string> | Array<Signal<string> | string>>,
  propertiesRef: { current: GlyphLayoutProperties | undefined },
) {
  const get = createGetBatchedProperties<GlyphProperties>(properties, glyphPropertyKeys)
  return computed<MeasureFunction | undefined>(() => {
    const font = fontSignal.value
    if (font == null) {
      return undefined
    }
    const textSignalValue = textSignal.value
    const layoutProperties: GlyphLayoutProperties = {
      font,
      fontSize: get('fontSize') ?? 16,
      letterSpacing: get('letterSpacing') ?? 0,
      lineHeight: get('lineHeight') ?? 1.2,
      text: Array.isArray(textSignalValue)
        ? textSignalValue.map((t) => readReactive(t)).join('')
        : readReactive(textSignalValue),
      wordBreak: get('wordBreak') ?? 'break-word',
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
