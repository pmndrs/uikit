import type { GlyphLayoutLine, GlyphLayoutProperties } from '../layout.js'

export type GlyphWrapper = (
  layout: GlyphLayoutProperties,
  availableWidth: number | undefined,
  textStartIndex: number,
  target: GlyphLayoutLine,
) => void

export function skipWhitespace(text: string, index: number): number {
  const textLength = text.length
  while (text[index] === ' ' && index < textLength) {
    index++
  }
  return index
}

export * from './breakall-wrapper.js'
export * from './nowrap-wrapper.js'
export * from './word-wrapper.js'
