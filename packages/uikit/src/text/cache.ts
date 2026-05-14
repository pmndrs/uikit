import { TextureLoader } from 'three'
import { Font, type FontInfo, type FontInfoSource } from './font.js'

const fontCache = new Map<FontInfoSource, Set<(font: Font) => void> | Font>()

const textureLoader = new TextureLoader()

export function loadCachedFont(fontInfoOrUrl: FontInfoSource, onLoad: (font: Font) => void): void {
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

async function loadFont(fontInfoOrUrl: FontInfoSource): Promise<Font> {
  const resolvedFontInfoOrUrl = await resolveFontInfoSource(fontInfoOrUrl)
  const info: FontInfo =
    typeof resolvedFontInfoOrUrl === 'object'
      ? resolvedFontInfoOrUrl
      : await (await fetch(resolvedFontInfoOrUrl)).json()

  if (info.pages.length !== 1) {
    throw new Error('only supporting exactly 1 page')
  }

  const page = await textureLoader.loadAsync(
    new URL(
      info.pages[0]!,
      typeof resolvedFontInfoOrUrl === 'string' ? new URL(resolvedFontInfoOrUrl, window.location.href) : undefined,
    ).href,
  )

  page.flipY = false

  return new Font(info, page)
}

function resolveFontInfoSource(fontInfoOrUrl: FontInfoSource): string | FontInfo | Promise<string | FontInfo> {
  return typeof fontInfoOrUrl === 'function' ? fontInfoOrUrl() : fontInfoOrUrl
}
