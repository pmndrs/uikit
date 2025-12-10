import { GenerateFontResult, MSDF } from '@zappar/msdf-generator'
import { FileLoader, Loader, LoadingManager } from 'three'

export type MSDFResult = GenerateFontResult

export interface TTFLoaderOptions {
  url?: string
  charset?: string
  fontSize?: number
  textureSize?: [number, number]
  fieldRange?: number
  fixOverlaps?: boolean
  onProgress?: (progress: number, completed: number, total: number) => void
}

export interface TTFLoaderBatchOptions {
  fonts?: TTFLoaderOptions[]
  onProgress?: (progress: number, completed: number, total: number) => void
}

const DEFAULT_OPTIONS: Required<Omit<TTFLoaderOptions, 'url' | 'onProgress'>> = {
  charset: ' \tABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,;:\'"()-[]{}@#$%&*+=/\\<>',
  fontSize: 48,
  textureSize: [512, 512],
  fieldRange: 4,
  fixOverlaps: true,
}

export class TTFLoader extends Loader {
  private _options: TTFLoaderOptions = {}

  constructor(manager?: LoadingManager) {
    super(manager)
  }

  setOptions(options: TTFLoaderOptions): this {
    this._options = options
    return this
  }

  override async loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<MSDFResult> {
    const loader = new FileLoader(this.manager)
    loader.setResponseType('arraybuffer')
    loader.setPath(this.path)
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    const generator = new MSDF()

    try {
      const [arrayBuffer] = await Promise.all([loader.loadAsync(url, onProgress), generator.initialize()])

      const finalOptions = { ...DEFAULT_OPTIONS, ...this._options }
      const fontBuffer = new Uint8Array(arrayBuffer as ArrayBuffer)

      return await generator.generate({
        font: fontBuffer,
        charset: finalOptions.charset,
        fontSize: finalOptions.fontSize,
        textureSize: finalOptions.textureSize,
        fieldRange: finalOptions.fieldRange,
        fixOverlaps: finalOptions.fixOverlaps,
        ...(finalOptions.onProgress ? { onProgress: finalOptions.onProgress } : {}),
      })
    } catch (err) {
      throw new Error(`MSDF generation failed for ${url}: ${(err as Error).message}`)
    } finally {
      generator.dispose()
    }
  }

  async loadMultipleAsync(
    urls: string[],
    options: TTFLoaderBatchOptions = {},
    onProgress?: (event: ProgressEvent) => void,
  ): Promise<MSDFResult> {
    if (urls.length === 0) {
      throw new Error('No URLs provided')
    }

    const loader = new FileLoader(this.manager)
    loader.setResponseType('arraybuffer')
    loader.setPath(this.path)
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    const generator = new MSDF()

    try {
      const fontPromises = urls.map((url) => loader.loadAsync(url, onProgress))
      const [arrayBuffers] = await Promise.all([Promise.all(fontPromises), generator.initialize()])

      const { fonts: perFontOptions, onProgress: progressCallback } = options

      const fonts = arrayBuffers.map((arrayBuffer, i) => {
        const fontOptions = perFontOptions?.[i] ?? {}
        const mergedOptions = { ...DEFAULT_OPTIONS, ...fontOptions }
        return {
          font: new Uint8Array(arrayBuffer as ArrayBuffer),
          charset: mergedOptions.charset,
          fontSize: mergedOptions.fontSize,
          textureSize: mergedOptions.textureSize,
          fieldRange: mergedOptions.fieldRange,
          fixOverlaps: mergedOptions.fixOverlaps,
        }
      })

      const generateOptions = {
        fonts,
        ...(progressCallback ? { onProgress: progressCallback } : {}),
      } as Parameters<typeof generator.generate>[0]

      return await generator.generate(generateOptions)
    } catch (err) {
      throw new Error(`MSDF batch generation failed: ${(err as Error).message}`)
    } finally {
      generator.dispose()
    }
  }
}
