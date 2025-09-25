import type { GlyphLayoutLine, GlyphOutProperties } from '../layout.js'

export type GlyphWrapper = (
  properties: GlyphOutProperties,
  availableWidth: number | undefined,
  textStartIndex: number,
  target: GlyphLayoutLine,
) => void

export * from './breakall-wrapper.js'
export * from './nowrap-wrapper.js'
export * from './word-wrapper.js'
