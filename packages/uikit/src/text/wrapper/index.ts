import type { GlyphLayoutLine, GlyphLayoutProperties } from '../layout.js'

export type GlyphWrapper = (
  layout: GlyphLayoutProperties,
  availableWidth: number | undefined,
  textStartIndex: number,
) => GlyphLayoutLine

export * from './breakall-wrapper.js'
export * from './nowrap-wrapper.js'
export * from './word-wrapper.js'
