import { suspend, preload, clear } from 'suspend-react'
import { TTFLoader, TTFInput, MSDFResult } from '@pmndrs/uikit'

export { TTFLoader, type TTFInput, type TTFInputItem, type TTFLoaderOptions, type MSDFResult } from '@pmndrs/uikit'

const ttfLoaderSymbol = Symbol('ttf-loader')

function getCacheKey(input: TTFInput): (symbol | TTFInput)[] {
  return [ttfLoaderSymbol, input]
}

function loadingFn(input: TTFInput) {
  return () => new TTFLoader().loadAsync(input)
}

export function useTTF(input: TTFInput): MSDFResult {
  return suspend(loadingFn(input), getCacheKey(input))
}

useTTF.preload = (input: TTFInput): void => {
  preload(loadingFn(input), getCacheKey(input))
}

useTTF.clear = (input: TTFInput): void => {
  clear(getCacheKey(input))
}
