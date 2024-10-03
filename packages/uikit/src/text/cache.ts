import { TextureLoader, WebGLRenderer } from 'three'
import { Font, FontInfo } from './font.js'

const fontCache = new Map<string | FontInfo, Set<(font: Font) => void> | Font>()

const textureLoader = new TextureLoader()

export function loadCachedFont(
  fontInfoOrUrl: string | FontInfo,
  renderer: WebGLRenderer,
  onLoad: (font: Font) => void,
): void {
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

  loadFont(fontInfoOrUrl, renderer)
    .then((font) => {
      for (const fn of set) {
        fn(font)
      }
      fontCache.set(fontInfoOrUrl, font)
    })
    .catch(console.error)
}

async function loadFont(fontInfoOrUrl: string | FontInfo, renderer: WebGLRenderer): Promise<Font> {
  const info: FontInfo = typeof fontInfoOrUrl === 'object' ? fontInfoOrUrl : await (await fetch(fontInfoOrUrl)).json()

  if (info.pages.length !== 1) {
    throw new Error('only supporting exactly 1 page')
  }

  const page = await textureLoader.loadAsync(
    new URL(info.pages[0], typeof fontInfoOrUrl === 'string' ? new URL(fontInfoOrUrl, window.location.href) : undefined)
      .href,
  )

  page.anisotropy = renderer.capabilities.getMaxAnisotropy()
  page.flipY = false

  return new Font(info, page)
}
