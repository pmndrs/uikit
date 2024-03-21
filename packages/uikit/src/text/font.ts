import { Signal, effect, signal } from '@preact/signals-core'
import { Texture, TypedArray, WebGLRenderer } from 'three'
import { createGetBatchedProperties } from '../properties/batched'
import { MergedProperties } from '../properties/merged'
import { Subscriptions } from '../utils'
import { loadCachedFont } from './cache'

export type FontFamilyUrls = Partial<Record<FontWeight, string>>

export type FontFamilies = Record<string, FontFamilyUrls>

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

const fontKeys = ['fontFamily', 'fontWeight']

export type FontFamilyProperties = { fontFamily?: string; fontWeight?: FontWeight }

const defaultFontFamilyUrls = {
  inter: {
    light: 'https://pmndrs.github.io/uikit/fonts/inter-light.json',
    normal: 'https://pmndrs.github.io/uikit/fonts/inter-normal.json',
    medium: 'https://pmndrs.github.io/uikit/fonts/inter-medium.json',
    'semi-bold': 'https://pmndrs.github.io/uikit/fonts/inter-semi-bold.json',
    bold: 'https://pmndrs.github.io/uikit/fonts/inter-bold.json',
  },
} satisfies FontFamilies

export function computeFont(
  properties: Signal<MergedProperties>,
  fontFamilies: FontFamilies = defaultFontFamilyUrls,
  renderer: WebGLRenderer,
  subscriptions: Subscriptions,
): Signal<Font | undefined> {
  const result = signal<Font | undefined>(undefined)
  const get = createGetBatchedProperties(properties, fontKeys)
  subscriptions.push(
    effect(() => {
      let fontWeight = (get('fontWeight') as FontWeight) ?? 'normal'
      if (typeof fontWeight === 'string') {
        fontWeight = fontWeightNames[fontWeight]
      }
      let fontFamily = get('fontFamily') as string
      if (fontFamily == null) {
        fontFamily = Object.keys(fontFamilies)[0]
      }
      const url = getMatchingFontUrl(fontFamilies[fontFamily], fontWeight)
      let canceled = false
      loadCachedFont(url, renderer, (font) => (canceled ? undefined : (result.value = font)))
      return () => (canceled = true)
    }),
  )
  return result
}

function getMatchingFontUrl(fontFamily: FontFamilyUrls, weight: number): string {
  let distance = Infinity
  let result: string | undefined
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
    padding: [number, number, number, number]
    spacing: [number, number, number, number]
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
  uvWidth: number
  uvHeight: number
  xoffset: number
  yoffset: number
  xadvance: number
  chnl: number
  uvX: number
  uvY: number
  page: number
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
  target[offset + 0] = info.uvX
  target[offset + 1] = info.uvY + info.uvHeight
  target[offset + 2] = info.uvWidth
  target[offset + 3] = -info.uvHeight
}
