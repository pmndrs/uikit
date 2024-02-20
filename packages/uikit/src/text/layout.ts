import { BreakallWrapper, NowrapWrapper, WordWrapper } from './wrapper/index.js'
import { Font } from './font.js'
import { getGlyphLayoutHeight } from './utils.js'

export type GlyphLayoutLine = { start: number; end: number; width: number; whitespaces: number }

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

const wrappers = {
  'keep-all': NowrapWrapper,
  'break-all': BreakallWrapper,
  'break-word': WordWrapper,
}

export function measureGlyphLayout(
  properties: GlyphLayoutProperties,
  availableWidth?: number,
): {
  width: number
  height: number
} {
  let width = 0

  let textIndex = 0

  const wrapper = wrappers[properties.wordBreak]

  let lines = 0

  const text = properties.text
  textIndex = skipWhitespace(text, textIndex, 0)

  while (textIndex < text.length) {
    const line = wrapper(properties, availableWidth, textIndex)

    const newTextIndex = skipWhitespace(text, line.end, 1)

    if (textIndex === newTextIndex) {
      break
    }

    width = Math.max(width, line.width)
    lines += 1
    textIndex = newTextIndex
  }

  return { width, height: getGlyphLayoutHeight(lines, properties) }
}

export function buildGlyphLayout(
  properties: GlyphLayoutProperties,
  availableWidth: number,
  availableHeight: number,
): GlyphLayout {
  const lines: Array<GlyphLayoutLine> = []

  let textIndex = 0

  const wrapper = wrappers[properties.wordBreak]

  const text = properties.text
  textIndex = skipWhitespace(text, textIndex, 0)

  while (textIndex < text.length) {
    const line = wrapper(properties, availableWidth, textIndex)

    const newTextIndex = skipWhitespace(text, line.end, 1)

    if (textIndex === newTextIndex) {
      break
    }

    lines.push(line)

    textIndex = newTextIndex
  }

  return {
    lines,
    availableHeight,
    availableWidth,
    ...properties,
  }
}

function skipWhitespace(text: string, index: number, skipLinefeeds: number): number {
  const textLength = text.length
  while (index < textLength) {
    const char = text[index]
    if (char === '\n') {
      if (skipLinefeeds === 0) {
        break
      }
      skipLinefeeds -= 1
    } else if (char != ' ') {
      break
    }
    index += 1
  }
  return index
}
