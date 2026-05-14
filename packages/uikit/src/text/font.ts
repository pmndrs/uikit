import {
  any as anySchema,
  boolean,
  custom,
  enum as enumSchema,
  number,
  partialRecord,
  record,
  string,
  union,
} from 'zod'
import type { z } from 'zod'
import { computed, effect, signal } from '@preact/signals-core'
import type { Signal } from '@preact/signals-core'
import type { Texture, TypedArray } from 'three'
import { loadCachedFont } from './cache.js'
import type { Properties } from '../properties/index.js'
import type { Container } from '../components/container.js'
import { isNumericString, type NumericString } from '../properties/values.js'
import { defineSchema } from '../properties/schema.js'

export const fontWeightNames = {
  thin: 100,
  'extra-light': 200,
  light: 300,
  normal: 400,
  medium: 500,
  'semi-bold': 600,
  bold: 700,
  'extra-bold': 800,
  black: 900,
  'extra-black': 950,
} as const

const numericStringSchema = /* @__PURE__ */ defineSchema(() =>
  custom<NumericString>(isNumericString, 'Expected a numeric string'),
)
const namedFontWeightSchema = /* @__PURE__ */ defineSchema(() =>
  enumSchema(Object.keys(fontWeightNames) as [keyof typeof fontWeightNames, ...(keyof typeof fontWeightNames)[]]),
)
const fontWeightKeySchema = /* @__PURE__ */ defineSchema(() => union([namedFontWeightSchema, numericStringSchema]))

export const FontWeightSchema = /* @__PURE__ */ defineSchema(() =>
  union([number(), namedFontWeightSchema, numericStringSchema]),
)

export type FontWeight = z.input<typeof FontWeightSchema>

export type GlyphInfo = {
  id: number
  index: number
  char: string
  width: number
  height: number
  x: number
  y: number
  xoffset: number
  yoffset: number
  xadvance: number
  chnl: number
  page: number
  uvWidth?: number
  uvHeight?: number
  uvX?: number
  uvY?: number
  renderSolid?: boolean
}

export type FontInfo = {
  pages: Array<string>
  chars: Array<GlyphInfo>
  info: {
    face: string
    size: number
    bold: number
    italic: number
    charset: Array<string>
    unicode: number
    stretchH: number
    smooth: number
    aa: number
    padding: Array<number>
    spacing: Array<number>
    outline: number
  }
  common: {
    lineHeight: number
    base: number
    scaleW: number
    scaleH: number
    pages: number
    packed: number
    alphaChnl: number
    redChnl: number
    greenChnl: number
    blueChnl: number
  }
  distanceField: {
    fieldType: string
    distanceRange: number
  }
  kernings: Array<{
    first: number
    second: number
    amount: number
  }>
}

export type FontInfoSource = string | FontInfo | (() => string | FontInfo | Promise<string | FontInfo>)

const fontFamilyWeightMapEntrySchema = /* @__PURE__ */ defineSchema(
  () => anySchema() as z.ZodType<FontInfoSource, FontInfoSource>,
)

export const FontFamilyWeightMapSchema = /* @__PURE__ */ defineSchema(() =>
  partialRecord(fontWeightKeySchema, fontFamilyWeightMapEntrySchema),
)

export type FontFamilyWeightMap = z.input<typeof FontFamilyWeightMapSchema>

export const FontFamiliesSchema = /* @__PURE__ */ defineSchema(() => record(string(), FontFamilyWeightMapSchema))

export type FontFamilies = z.input<typeof FontFamiliesSchema>

export type FontFamilyProperties = { fontFamily?: string; fontWeight?: FontWeight; fontFamilies?: FontFamilies }

const defaultFontFamiles: FontFamilies = {
  inter: {
    light: () => import('@pmndrs/msdfonts/inter').then(({ inter }) => inter.light),
    medium: () => import('@pmndrs/msdfonts/inter').then(({ inter }) => inter.medium),
    'semi-bold': () => import('@pmndrs/msdfonts/inter').then(({ inter }) => inter['semi-bold']),
    bold: () => import('@pmndrs/msdfonts/inter').then(({ inter }) => inter.bold),
  },
}

export function computedFontFamilies(properties: Properties, parent: Signal<Container | undefined>) {
  return computed(() => {
    const currentFontFamilies = properties.value.fontFamilies
    const inheritedFontFamilies = parent.value?.fontFamilies.value
    if (inheritedFontFamilies == null) {
      return currentFontFamilies
    }
    if (currentFontFamilies == null) {
      return inheritedFontFamilies
    }
    return {
      ...inheritedFontFamilies,
      ...currentFontFamilies,
    }
  })
}

export function computedFont(
  properties: Properties,
  fontFamiliesSignal: Signal<FontFamilies | undefined>,
): Signal<Font | undefined> {
  const result = signal<Font | undefined>(undefined)
  effect(() => {
    if (!properties.enabled.value) {
      return
    }
    let fontWeight: FontWeight = properties.value.fontWeight
    if (typeof fontWeight === 'string') {
      fontWeight = parseFloat(fontWeight)
      if (isNaN(fontWeight)) {
        fontWeight = properties.value.fontWeight
        if (!(fontWeight in fontWeightNames)) {
          throw new Error(`unknown font weight "${fontWeight}"`)
        }
        fontWeight = fontWeightNames[fontWeight as keyof typeof fontWeightNames]
      }
    }
    let fontFamily = properties.value.fontFamily
    const fontFamilies = fontFamiliesSignal.value ?? defaultFontFamiles
    fontFamily ??= Object.keys(fontFamilies)[0]!
    let fontFamilyWeightMap = fontFamilies[fontFamily]
    if (fontFamilyWeightMap == null) {
      const availableFontFamilyList = Object.keys(fontFamilies)
      fontFamilyWeightMap = fontFamilies[availableFontFamilyList[0] as any]!
      console.error(
        `unknown font family "${fontFamily}". Available font families are ${availableFontFamilyList.map((name) => `"${name}"`).join(', ')}. Falling back to "${availableFontFamilyList[0]}".`,
      )
    }
    const url = getMatchingFontUrl(fontFamilyWeightMap, fontWeight)
    let aborted = false
    loadCachedFont(url, (font) => !aborted && (result.value = font))
    return () => (aborted = true)
  })
  return result
}

function getMatchingFontUrl(fontFamily: FontFamilyWeightMap, weight: number): FontInfoSource {
  let distance = Infinity
  let result: FontInfoSource | undefined
  for (const fontWeight of Object.keys(fontFamily) as Array<keyof FontFamilyWeightMap>) {
    const d = Math.abs(weight - getWeightNumber(fontWeight))
    if (d === 0) {
      return fontFamily[fontWeight]!
    }
    if (d < distance) {
      distance = d
      result = fontFamily[fontWeight]
    }
  }
  if (result == null) {
    throw new Error(`font family has no entries ${fontFamily}`)
  }
  return result
}

function getWeightNumber(value: string): number {
  if (value in fontWeightNames) {
    return fontWeightNames[value as keyof typeof fontWeightNames]
  }
  const number = parseFloat(value)
  if (isNaN(number)) {
    throw new Error(`invalid font weight "${value}"`)
  }
  return number
}

const MISSING_GLYPH: GlyphInfo = {
  id: -1,
  index: 0,
  char: '',
  chnl: 0,
  page: 0,
  x: 0,
  y: 0,
  width: 0.5,
  height: 0.5,
  xadvance: 0.6,
  xoffset: 0,
  yoffset: 0.3,
  uvX: 0,
  uvY: 0,
  uvWidth: 0,
  uvHeight: 0,
  renderSolid: true,
} as const

export class Font {
  private glyphInfoMap = new Map<string, GlyphInfo>()
  private kerningMap = new Map<string, number>()

  //needed in the shader:
  public readonly pageWidth: number
  public readonly pageHeight: number
  public readonly distanceRange: number

  constructor(
    info: FontInfo,
    public page: Texture,
  ) {
    const { scaleW, scaleH, lineHeight } = info.common
    const { size } = info.info

    this.pageWidth = scaleW
    this.pageHeight = scaleH
    this.distanceRange = info.distanceField.distanceRange

    for (const glyph of info.chars) {
      const normalizedGlyph: GlyphInfo = {
        ...glyph,
        uvX: glyph.x / scaleW,
        uvY: glyph.y / scaleH,
        uvWidth: glyph.width / scaleW,
        uvHeight: glyph.height / scaleH,
        width: glyph.width / size,
        height: glyph.height / size,
        xadvance: glyph.xadvance / size,
        xoffset: glyph.xoffset / size,
        yoffset: (glyph.yoffset - (lineHeight - size)) / size,
      }
      this.glyphInfoMap.set(normalizedGlyph.char, normalizedGlyph)
    }

    for (const { first, second, amount } of info.kernings) {
      this.kerningMap.set(`${first}/${second}`, amount / size)
    }
  }

  getGlyphInfo(char: string): GlyphInfo {
    const glyph = this.glyphInfoMap.get(char)
    if (glyph) return glyph

    if (char === '\n') {
      const space = this.glyphInfoMap.get(' ')
      if (space) return space
    }

    console.warn(`Missing glyph info for character "${char}"`)
    return MISSING_GLYPH
  }

  getKerning(firstId: number, secondId: number): number {
    return this.kerningMap.get(`${firstId}/${secondId}`) ?? 0
  }
}

export function glyphIntoToUV(info: GlyphInfo, target: TypedArray, offset: number): void {
  target[offset + 0] = info.uvX!
  target[offset + 1] = info.uvY! + info.uvHeight!
  target[offset + 2] = info.uvWidth!
  target[offset + 3] = -info.uvHeight!
}
