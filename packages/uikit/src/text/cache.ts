import { TextureLoader, WebGLRenderer } from 'three'
import { Font, FontInfo } from './font.js'
import { PlatformConstants } from '../index.js'

const fontCache = new Map<string, Set<(font: Font) => void> | Font>()

export type FontLoadingData = string | { json: any; url: string }

export function loadCachedFont(data: FontLoadingData, renderer: WebGLRenderer, onLoad: (font: Font) => void): void {
  const identifier = typeof data === 'string' ? data : data.url
  let entry = fontCache.get(identifier)
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
  fontCache.set(identifier, set)

  loadFont(data, renderer)
    .then((font) => {
      for (const fn of set) {
        fn(font)
      }
      fontCache.set(identifier, font)
    })
    .catch(console.error)
}

let textureLoader: TextureLoader | undefined

async function loadFont(data: FontLoadingData, renderer: WebGLRenderer): Promise<Font> {
  let info: FontInfo
  let url: string | URL
  if (typeof data === 'string') {
    info = await (await fetch(data)).json()

    if (info.pages.length !== 1) {
      throw new Error('only supporting exactly 1 page')
    }
    url = new URL(info.pages[0], data).href
  } else {
    info = data.json
    url = data.url
  }

  textureLoader ??= new PlatformConstants.TextureLoader()
  const page = await textureLoader.loadAsync(url)

  page.anisotropy = renderer.capabilities.getMaxAnisotropy()
  page.flipY = false

  return new Font(info, page)
}
