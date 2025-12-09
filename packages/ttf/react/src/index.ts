import { suspend, preload, clear } from 'suspend-react'
import { TTFLoader, TTFLoaderOptions, TTFLoaderBatchOptions, MSDFResult } from '@pmndrs/uikit-ttf'

export type { MSDFResult, TTFLoaderOptions, TTFLoaderBatchOptions } from '@pmndrs/uikit-ttf'
export { TTFLoader } from '@pmndrs/uikit-ttf'

function loadingFn(input: string | string[], options: TTFLoaderBatchOptions | TTFLoaderOptions | TTFLoaderOptions[]) {
  return async () => {
    const urls = Array.isArray(input) ? input : [input]
    const loader = new TTFLoader()

    if (urls.length === 1) {
      const opts = Array.isArray(options) ? (options[0] ?? {}) : options
      loader.setOptions(opts)
      return await loader.loadAsync(urls[0]!)
    }

    const isBatchOptions = !Array.isArray(options) && 'fonts' in options
    const batchOptions: TTFLoaderBatchOptions = isBatchOptions
      ? (options as TTFLoaderBatchOptions)
      : { fonts: Array.isArray(options) ? options : urls.map(() => options) }

    return await loader.loadMultipleAsync(urls, batchOptions)
  }
}

export function useTTF(input: string, options?: TTFLoaderOptions): MSDFResult
export function useTTF(input: string[], options?: TTFLoaderBatchOptions | TTFLoaderOptions[]): MSDFResult
export function useTTF(
  input: string | string[],
  options: TTFLoaderBatchOptions | TTFLoaderOptions | TTFLoaderOptions[] = {},
): MSDFResult {
  const urls = Array.isArray(input) ? input : [input]
  const isBatchOptions = !Array.isArray(options) && urls.length > 1 && 'fonts' in options
  const isArrayOptions = Array.isArray(options)

  let optionsArray: TTFLoaderOptions[]
  if (isBatchOptions) {
    const { fonts: perFontOptions, ...globalOpts } = options as TTFLoaderBatchOptions
    optionsArray = urls.map((_, i) => ({ ...globalOpts, ...(perFontOptions?.[i] ?? {}) }))
  } else if (isArrayOptions) {
    optionsArray = urls.map((_, i) => options[i] ?? {})
  } else {
    optionsArray = urls.map(() => options as TTFLoaderOptions)
  }

  const keys = urls.map((url, i) => [url, JSON.stringify(optionsArray[i])])
  return suspend(loadingFn(input, options), ['ttf', ...keys.flat()]) as MSDFResult
}

useTTF.preload = (
  input: string | string[],
  options: TTFLoaderBatchOptions | TTFLoaderOptions | TTFLoaderOptions[] = {},
): void => {
  const urls = Array.isArray(input) ? input : [input]
  const optionsArray = Array.isArray(options) ? options : Array.isArray(input) ? urls.map(() => options) : [options]
  const keys = urls.map((url, i) => [url, JSON.stringify(optionsArray[i] ?? {})])
  return preload(loadingFn(input, options), ['ttf', ...keys.flat()])
}

useTTF.clear = (
  input: string | string[],
  options: TTFLoaderBatchOptions | TTFLoaderOptions | TTFLoaderOptions[] = {},
): void => {
  const urls = Array.isArray(input) ? input : [input]
  const optionsArray = Array.isArray(options) ? options : Array.isArray(input) ? urls.map(() => options) : [options]
  const keys = urls.map((url, i) => [url, JSON.stringify(optionsArray[i] ?? {})])
  return clear(['ttf', ...keys.flat()])
}
