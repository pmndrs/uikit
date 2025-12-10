import { suspend, preload, clear } from 'suspend-react'
import { TTFLoader, TTFLoaderOptions, MSDFResult } from '@pmndrs/uikit-ttf'

export type { MSDFResult, TTFLoaderOptions } from '@pmndrs/uikit-ttf'
export { TTFLoader } from '@pmndrs/uikit-ttf'

export type TTFInputItem = string | (TTFLoaderOptions & { url: string })
export type TTFInput = string | TTFInputItem[]

type NormalizedFont = TTFLoaderOptions & { url: string }

function normalizeInput(input: TTFInput): NormalizedFont[] {
  if (!Array.isArray(input)) {
    input = [input]
  }
  return input.map((item) => (typeof item === 'string' ? { url: item } : item)) as NormalizedFont[]
}

function loadingFn(fonts: NormalizedFont[]) {
  return async () => {
    const loader = new TTFLoader()
    const urls = fonts.map((f) => f.url)
    const fontOptions = fonts.map(({ url: _, ...options }) => options)

    if (fonts.length === 1) {
      loader.setOptions(fontOptions[0] ?? {})
      return await loader.loadAsync(urls[0] ?? '')
    }

    return await loader.loadMultipleAsync(urls, { fonts: fontOptions })
  }
}

export function useTTF(input: TTFInput): MSDFResult {
  const fonts = normalizeInput(input)
  const keys = fonts.map((f) => [f.url, JSON.stringify(f)])
  return suspend(loadingFn(fonts), ['ttf', ...keys.flat()]) as MSDFResult
}

useTTF.preload = (input: TTFInput): void => {
  const fonts = normalizeInput(input)
  const keys = fonts.map((f) => [f.url, JSON.stringify(f)])
  return preload(loadingFn(fonts), ['ttf', ...keys.flat()])
}

useTTF.clear = (input: TTFInput): void => {
  const fonts = normalizeInput(input)
  const keys = fonts.map((f) => [f.url, JSON.stringify(f)])
  return clear(['ttf', ...keys.flat()])
}
