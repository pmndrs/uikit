import type { GenerateFontOptions, GenerateFontResult, MSDFGeneratorOptions } from '@zappar/msdf-generator'
import { FileLoader, Loader, LoadingManager } from 'three'

export type MSDFResult = GenerateFontResult

export interface TTFLoaderOptions extends Partial<Omit<MSDFGeneratorOptions, 'font'>> {
  url?: string
  onProgress?: (progress: number, completed: number, total: number) => void
}

export type TTFInputItem = string | (TTFLoaderOptions & { url: string })
export type TTFInput = string | TTFInputItem[]

type NormalizedFont = Omit<TTFLoaderOptions, 'url'> & { url: string }

const DEFAULT_OPTIONS = Object.freeze({
  charset: ' \tABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,;:\'"()-[]{}@#$%&*+=/\\<>',
  fontSize: 48,
  textureSize: [512, 512],
  fieldRange: 4,
  padding: 4,
  fixOverlaps: true,
})

function normalizeInput(input: TTFInput): NormalizedFont[] {
  const items = Array.isArray(input) ? input : [input]

  return items.map((item, index) => {
    if (typeof item === 'string') return { url: item }
    if (!item.url) throw new Error(`TTFLoader: Font at index ${index} is missing 'url'`)
    return { ...item, url: item.url }
  })
}

export class TTFLoader extends Loader<MSDFResult, TTFInput> {
  constructor(manager?: LoadingManager) {
    super(manager)
  }

  override load(
    input: TTFInput,
    onLoad: (data: MSDFResult) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): void {
    this.loadAsync(input, onProgress)
      .then(onLoad)
      .catch((err) => {
        if (onError) {
          onError(err)
        } else {
          console.error('TTFLoader:', err)
        }
      })
  }

  override async loadAsync(input: TTFInput, onProgress?: (event: ProgressEvent) => void): Promise<MSDFResult> {
    const fonts = normalizeInput(input)
    const arrayBuffers = await this._loadFontFiles(fonts, onProgress)
    return this._generate(arrayBuffers, fonts)
  }

  private async _loadFontFiles(
    fonts: NormalizedFont[],
    onProgress?: (event: ProgressEvent) => void,
  ): Promise<ArrayBuffer[]> {
    const loader = new FileLoader(this.manager)
    loader.setResponseType('arraybuffer')
    loader.setPath(this.path)
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)

    const loadPromises = fonts.map((font) => loader.loadAsync(font.url, onProgress))

    return Promise.all(loadPromises) as Promise<ArrayBuffer[]>
  }

  private async _generate(arrayBuffers: ArrayBuffer[], fonts: NormalizedFont[]): Promise<MSDFResult> {
    const { MSDF } = await import('@zappar/msdf-generator')
    const generator = new MSDF()

    try {
      await generator.initialize()

      const fontConfigs = arrayBuffers.map((arrayBuffer, index) => {
        const opts = fonts[index]
        return {
          font: new Uint8Array(arrayBuffer),
          charset: opts?.charset ?? DEFAULT_OPTIONS.charset,
          fontSize: opts?.fontSize ?? DEFAULT_OPTIONS.fontSize,
          textureSize: opts?.textureSize ?? DEFAULT_OPTIONS.textureSize,
          fieldRange: opts?.fieldRange ?? DEFAULT_OPTIONS.fieldRange,
          padding: opts?.padding ?? DEFAULT_OPTIONS.padding,
          fixOverlaps: opts?.fixOverlaps ?? DEFAULT_OPTIONS.fixOverlaps,
        }
      })

      if (fontConfigs.length === 1) {
        const [config] = fontConfigs
        const [font] = fonts
        return await generator.generate({ ...config, onProgress: font?.onProgress } as GenerateFontOptions)
      }

      return await generator.generate({ fonts: fontConfigs } as GenerateFontOptions)
    } catch (err) {
      const urls = fonts.map((f) => f.url).join(', ')
      throw new Error(`TTFLoader: MSDF generation failed for ${urls}: ${err instanceof Error ? err.message : err}`)
    } finally {
      generator.dispose()
    }
  }
}
