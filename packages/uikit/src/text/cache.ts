import { TextureLoader } from 'three'
import { Font, FontInfo, FontFamilies } from './font.js'
import { inter } from '@pmndrs/msdfonts'

const fontCache = new Map<string | FontInfo, Set<(font: Font) => void> | Font>()
const fontFamilyRegistry = new Map<string, FontFamilies[string]>([['inter', inter]])

const textureLoader = new TextureLoader()

export function loadCachedFont(fontInfoOrUrl: string | FontInfo, onLoad: (font: Font) => void): void {
  let entry = fontCache.get(fontInfoOrUrl)
  if (entry instanceof Set) {
    entry.add(onLoad)
    return
  }
  if (entry != null) {
    onLoad(entry)
    return
  }

  const set = new Set<(font: Font) => void>()
  set.add(onLoad)
  fontCache.set(fontInfoOrUrl, set)

  loadFont(fontInfoOrUrl)
    .then((font) => {
      for (const fn of set) {
        fn(font)
      }
      fontCache.set(fontInfoOrUrl, font)
    })
    .catch(console.error)
}

async function loadFont(fontInfoOrUrl: string | FontInfo): Promise<Font> {
  const info: FontInfo = typeof fontInfoOrUrl === 'object' ? fontInfoOrUrl : await (await fetch(fontInfoOrUrl)).json()

  if (info.pages.length !== 1) {
    throw new Error('only supporting exactly 1 page')
  }

  const page = await textureLoader.loadAsync(
    new URL(
      info.pages[0]!,
      typeof fontInfoOrUrl === 'string' ? new URL(fontInfoOrUrl, window.location.href) : undefined,
    ).href,
  )

  page.flipY = false

  return new Font(info, page)
}

export function registerFontFamilies(fontFamilies: FontFamilies): void {
  for (const [familyName, weightMap] of Object.entries(fontFamilies)) fontFamilyRegistry.set(familyName, weightMap)
}

export function hasFontFamily(familyName: string): boolean {
  return fontFamilyRegistry.has(familyName)
}

export function getFontFamily(familyName: string): FontFamilies[string] | undefined {
  return fontFamilyRegistry.get(familyName)
}

export function clearFontCache(): void {
  fontCache.clear()
  fontFamilyRegistry.clear()
  fontFamilyRegistry.set('inter', inter)
}
