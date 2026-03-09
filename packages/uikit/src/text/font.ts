import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Texture, TypedArray } from 'three'
import { loadCachedFont } from './cache.js'
import { Properties } from '../properties/index.js'
import { inter } from '@ni2khanna/msdfonts'
import { Container } from '../components/container.js'

export type FontFamilyWeightMap = Partial<Record<FontWeight, string | FontInfo>>

export type FontFamilies = Record<string, FontFamilyWeightMap>

const fontWeightNames = {
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
}

export type FontWeight = keyof typeof fontWeightNames | number | ({} & string)

export type FontFamilyList = string | Array<string>

export type FontFamilyProperties = {
  fontFamily?: FontFamilyList
  fontFamilyFallbacks?: FontFamilyList
  fontWeight?: FontWeight
  fontFamilies?: FontFamilies
}

const defaultFontFamiles: FontFamilies = {
  inter,
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
    let fontFamily = normalizeFontFamilyList(properties.value.fontFamily)[0]
    const fontFamilies = fontFamiliesSignal.value ?? defaultFontFamiles
    fontFamily ??= Object.keys(fontFamilies)[0]!
    const family = fontFamilies[fontFamily as keyof FontFamilies]
    if (family == null) {
      throw new Error(`unknown font family "${fontFamily}"`)
    }
    const url = getMatchingFontUrl(family, fontWeight)
    let aborted = false
    loadCachedFont(url, (font) => !aborted && (result.value = font))
    return () => (aborted = true)
  })
  return result
}

export function computedFonts(
  properties: Properties,
  fontFamiliesSignal: Signal<FontFamilies | undefined>,
): Signal<ResolvedFontFamily | undefined> {
  const result = signal<ResolvedFontFamily | undefined>(undefined)
  effect(() => {
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

    const fontFamilies = fontFamiliesSignal.value ?? defaultFontFamiles
    const familyNames = getOrderedFontFamilyNames(
      fontFamilies,
      properties.value.fontFamily,
      properties.value.fontFamilyFallbacks,
    )
    if (familyNames.length === 0) {
      result.value = undefined
      return
    }

    const entries = familyNames.flatMap((familyName) => {
      const family = fontFamilies[familyName as keyof FontFamilies]
      if (family == null) {
        return []
      }
      return [{ familyName, url: getMatchingFontUrl(family, fontWeight) }] as const
    })

    if (entries.length === 0) {
      result.value = undefined
      return
    }

    let aborted = false
    const loadedFonts = new Map<string | FontInfo, Font>()

    const updateResult = () => {
      if (aborted) {
        return
      }
      const primaryFont = loadedFonts.get(entries[0]!.url)
      if (primaryFont == null) {
        result.value = undefined
        return
      }
      const fonts = entries
        .map(({ url }) => loadedFonts.get(url))
        .filter((font): font is Font => font != null)
      result.value = new ResolvedFontFamily(primaryFont, fonts.slice(1))
    }

    for (const { url } of entries) {
      loadCachedFont(url, (font) => {
        loadedFonts.set(url, font)
        updateResult()
      })
    }

    return () => {
      aborted = true
    }
  })
  return result
}

function getOrderedFontFamilyNames(fontFamilies: FontFamilies, primary?: FontFamilyList, fallbacks?: FontFamilyList) {
  const ordered = new Set<string>()
  const primaryFamilies = normalizeFontFamilyList(primary)
  const fallbackFamilies = normalizeFontFamilyList(fallbacks)
  const allFamilies = Object.keys(fontFamilies)
  const firstFamily = primaryFamilies[0] ?? allFamilies[0]
  if (firstFamily != null) {
    ordered.add(firstFamily)
  }
  for (const familyName of primaryFamilies.slice(1)) {
    ordered.add(familyName)
  }
  for (const familyName of fallbackFamilies) {
    ordered.add(familyName)
  }
  for (const familyName of allFamilies) {
    ordered.add(familyName)
  }
  return Array.from(ordered).filter((familyName) => familyName in fontFamilies)
}

function normalizeFontFamilyList(value: FontFamilyList | undefined) {
  if (value == null) {
    return []
  }
  const values = Array.isArray(value) ? value : value.split(',')
  return values.map((entry) => entry.trim()).filter(Boolean)
}

function getMatchingFontUrl(fontFamily: FontFamilyWeightMap, weight: number): string | FontInfo {
  let distance = Infinity
  let result: string | FontInfo | undefined
  for (const fontWeight in fontFamily) {
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
}

export class Font {
  private glyphInfoMap = new Map<string, GlyphInfo>()
  private kerningMap = new Map<string, number>()

  private questionmarkGlyphInfo: GlyphInfo

  //needed in the shader:
  public readonly pageWidth: number
  public readonly pageHeight: number
  public readonly distanceRange: number

  constructor(
    info: FontInfo,
    public page: Texture,
  ) {
    const { scaleW, scaleH, lineHeight } = info.common

    this.pageWidth = scaleW
    this.pageHeight = scaleH
    this.distanceRange = info.distanceField.distanceRange

    const { size } = info.info

    for (const glyph of info.chars) {
      glyph.uvX = glyph.x / scaleW
      glyph.uvY = glyph.y / scaleH
      glyph.uvWidth = glyph.width / scaleW
      glyph.uvHeight = glyph.height / scaleH
      glyph.width /= size
      glyph.height /= size
      glyph.xadvance /= size
      glyph.xoffset /= size
      glyph.yoffset -= lineHeight - size
      glyph.yoffset /= size
      this.glyphInfoMap.set(glyph.char, glyph)
    }

    for (const { first, second, amount } of info.kernings) {
      this.kerningMap.set(`${first}/${second}`, amount / size)
    }

    const questionmarkGlyphInfo = this.glyphInfoMap.get('?')
    if (questionmarkGlyphInfo == null) {
      throw new Error("missing '?' glyph in font")
    }
    this.questionmarkGlyphInfo = questionmarkGlyphInfo
  }

  hasGlyph(char: string): boolean {
    return this.glyphInfoMap.has(char)
  }

  getOptionalGlyphInfo(char: string): GlyphInfo | undefined {
    return this.glyphInfoMap.get(char)
  }

  getGlyphInfo(char: string): GlyphInfo {
    return (
      this.glyphInfoMap.get(char) ??
      (char == '\n' ? this.glyphInfoMap.get(' ') : this.questionmarkGlyphInfo) ??
      this.questionmarkGlyphInfo
    )
  }

  getKerning(firstId: number, secondId: number): number {
    return this.kerningMap.get(`${firstId}/${secondId}`) ?? 0
  }
}

export type ResolvedGlyph = {
  font: Font
  glyphInfo: GlyphInfo
}

export class ResolvedFontFamily {
  private readonly fonts: Array<Font>
  private readonly glyphCache = new Map<string, ResolvedGlyph>()

  constructor(
    public readonly primaryFont: Font,
    fallbackFonts: Array<Font>,
  ) {
    this.fonts = [primaryFont, ...fallbackFonts]
  }

  resolveGlyph(char: string): ResolvedGlyph {
    const cached = this.glyphCache.get(char)
    if (cached != null) {
      return cached
    }

    let glyph: ResolvedGlyph | undefined

    if (char === '\n') {
      glyph = { font: this.primaryFont, glyphInfo: this.primaryFont.getGlyphInfo(' ') }
    } else {
      for (const font of this.fonts) {
        const glyphInfo = font.getOptionalGlyphInfo(char)
        if (glyphInfo == null) {
          continue
        }
        glyph = { font, glyphInfo }
        break
      }
    }

    glyph ??= { font: this.primaryFont, glyphInfo: this.primaryFont.getGlyphInfo(char) }
    this.glyphCache.set(char, glyph)
    return glyph
  }

  getKerning(previousGlyph: ResolvedGlyph | undefined, nextGlyph: ResolvedGlyph): number {
    if (previousGlyph == null || previousGlyph.font !== nextGlyph.font) {
      return 0
    }
    return nextGlyph.font.getKerning(previousGlyph.glyphInfo.id, nextGlyph.glyphInfo.id)
  }
}

export function glyphIntoToUV(info: GlyphInfo, target: TypedArray, offset: number): void {
  target[offset + 0] = info.uvX!
  target[offset + 1] = info.uvY! + info.uvHeight!
  target[offset + 2] = info.uvWidth!
  target[offset + 3] = -info.uvHeight!
}
