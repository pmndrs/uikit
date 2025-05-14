import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Texture, TypedArray } from 'three'
import { loadCachedFont } from './cache.js'
import { Properties } from '../properties/index.js'
import { inter } from '@pmndrs/msdfonts'
import { Container } from '../vanilla/container.js'

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

export type FontWeight = keyof typeof fontWeightNames | number

export type FontFamilyProperties = { fontFamily?: string; fontWeight?: FontWeight; fontFamilies?: FontFamilies }

const defaultFontFamiles: FontFamilies = {
  inter,
}

export function computedFontFamilies(properties: Properties, parent: Signal<Container | undefined>) {
  return computed(() => {
    const currentFontFamilies = properties.get('fontFamilies')
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
    const fontWeight = properties.get('fontWeight')
    let fontFamily = properties.get('fontFamily')
    const fontFamilies = fontFamiliesSignal.value ?? defaultFontFamiles
    fontFamily ??= Object.keys(fontFamilies)[0]!
    const url = getMatchingFontUrl(
      fontFamilies[fontFamily as keyof FontFamilies]!,
      typeof fontWeight === 'string' ? fontWeightNames[fontWeight] : fontWeight,
    )
    loadCachedFont(url, (font) => (result.value = font))
  })
  return result
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

export function glyphIntoToUV(info: GlyphInfo, target: TypedArray, offset: number): void {
  target[offset + 0] = info.uvX!
  target[offset + 1] = info.uvY! + info.uvHeight!
  target[offset + 2] = info.uvWidth!
  target[offset + 3] = -info.uvHeight!
}
