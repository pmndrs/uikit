import { BreakallWrapper, NowrapWrapper, WordWrapper } from './wrapper/index.js'
import { Font } from './font.js'
import { getGlyphLayoutHeight } from './utils.js'
import { Signal, computed } from '@preact/signals-core'
import { MeasureMode } from 'yoga-layout/load'
import { BaseOutputProperties, Properties } from '../properties/index.js'
import { CustomLayouting } from '../flex/index.js'
import { ThreeEventMap } from '../events.js'
import { AdditionalTextDefaults } from './render/index.js'

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

export type WordBreak = keyof typeof wrappers

export type GlyphLayoutProperties = {
  text: string
  font: Font
  letterSpacing: number
  lineHeight: number | `${number}%`
  fontSize: number
  wordBreak: WordBreak
}

export function computedCustomLayouting(
  properties: Properties<BaseOutputProperties<ThreeEventMap> & AdditionalTextDefaults>,
  fontSignal: Signal<Font | undefined>,
  propertiesRef: { current: GlyphLayoutProperties | undefined },
) {
  return computed<CustomLayouting | undefined>(() => {
    const font = fontSignal.value
    if (font == null) {
      return undefined
    }
    const textProperty = properties.value.text
    let text = Array.isArray(textProperty) ? textProperty.join('') : textProperty
    //TODO: tab should be intergrated into the text layouting algorithm
    text = text.replaceAll('\t', ' '.repeat(4))
    const layoutProperties: GlyphLayoutProperties = {
      font,
      fontSize: properties.value.fontSize,
      letterSpacing: properties.value.letterSpacing,
      lineHeight: properties.value.lineHeight,
      text,
      wordBreak: properties.value.wordBreak,
    }
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
