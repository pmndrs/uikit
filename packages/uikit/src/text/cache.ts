import { TextureLoader, WebGLRenderer } from 'three'
import { Font, FontDefinition, FontInfo, FontUrls, isComplexDefinition } from './font.js'

const fontCache = new Map<string, Set<(font: Font) => void> | Font>()

const textureLoader = new TextureLoader()

export function loadCachedFont(url: FontDefinition, renderer: WebGLRenderer, onLoad: (font: Font) => void): void {
  const jsonUrl = isComplexDefinition(url) ? url.jsonUrl : url
  let entry = fontCache.get(jsonUrl)
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
  fontCache.set(jsonUrl, set)

  loadFont(url, renderer)
    .then((font) => {
      for (const fn of set) {
        fn(font)
      }
      fontCache.set(jsonUrl, font)
    })
    .catch(console.error)
}

async function loadFont(url: FontDefinition, renderer: WebGLRenderer): Promise<Font> {
  const jsonUrl = isComplexDefinition(url) ? url.jsonUrl : url
  const info: FontInfo = await (await fetch(jsonUrl)).json()
  const pageUrl = isComplexDefinition(url) ? url.pageUrl : info.pages[0]

  if (info.pages.length !== 1) {
    throw new Error('only supporting exactly 1 page')
  }

  const page = await textureLoader.loadAsync(new URL(pageUrl, new URL(pageUrl, window.location.href)).href)

  page.anisotropy = renderer.capabilities.getMaxAnisotropy()
  page.flipY = false

  return new Font(info, page)
}
