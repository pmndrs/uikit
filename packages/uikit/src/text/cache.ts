import { TextureLoader, WebGLRenderer } from 'three'
import { Font, FontInfo } from './font.js'

const fontCache = new Map<string, Set<(font: Font) => void> | Font>()

const textureLoader = new TextureLoader()

export function loadCachedFont(url: string, renderer: WebGLRenderer, onLoad: (font: Font) => void): void {
  let entry = fontCache.get(url)
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
  fontCache.set(url, set)

  loadFont(url, renderer)
    .then((font) => {
      for (const fn of set) {
        fn(font)
      }
      fontCache.set(url, font)
    })
    .catch(console.error)
}

async function loadFont(url: string, renderer: WebGLRenderer): Promise<Font> {
  const info: FontInfo = await (await fetch(url)).json()

  if (info.pages.length !== 1) {
    throw new Error('only supporting exactly 1 page')
  }

  const page = await textureLoader.loadAsync(new URL(info.pages[0], new URL(url, window.location.href)).href)

  page.anisotropy = renderer.capabilities.getMaxAnisotropy()
  page.flipY = false

  return new Font(info, page)
}
