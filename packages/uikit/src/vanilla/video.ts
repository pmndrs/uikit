import { AdditionalImageProperties, Image } from './image.js'
import { VideoTexture } from 'three'
import { Signal, computed, signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { AllProperties, Properties } from '../properties/index.js'
import { RenderContext } from '../components/root.js'
import { abortableEffect } from '../utils.js'

export type VideoProperties<EM extends ThreeEventMap> = AllProperties<EM, AdditionalVideoProperties>

export type AdditionalVideoProperties = {
  src: HTMLVideoElement['src'] | HTMLVideoElement['srcObject'] | Omit<HTMLVideoElement, 'src' | 'playsInline' | 'style'>
} & Omit<AdditionalImageProperties, 'src'>

export class Video<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Image<T, EM> {
  readonly element: Signal<HTMLVideoElement>

  constructor(
    inputProperties?: VideoProperties<EM>,
    initialClasses?: Array<VideoProperties<EM>>,
    renderContext?: RenderContext,
  ) {
    const aspectRatio = signal<number>(1)
    const texture = signal<VideoTexture | undefined>(undefined)
    //TODO: bad idea to modify the initial properties, as they will be overwritten via resetProperties
    //TODO: input -> output renaming. here specificially: src -> inputSrc, texture -> src
    super({ ...inputProperties, aspectRatio, src: texture }, initialClasses, renderContext)

    this.element = computed(() => {
      const src = this.properties.get('inputSrc')
      return src instanceof HTMLVideoElement ? src : document.createElement('video')
    })

    abortableEffect(() => {
      const src = this.properties.get('inputSrc')
      if (src instanceof HTMLVideoElement) {
        return
      }
      updateVideoElement(this.element.value, this.properties)
    }, this.abortSignal)

    abortableEffect(() => {
      const { requestRender } = this.root.value
      if (requestRender == null) {
        return
      }
      const element = this.element.value
      let requestId: number
      const callback = () => {
        requestRender()
        requestId = element.requestVideoFrameCallback(callback)
      }
      requestId = element.requestVideoFrameCallback(callback)
      return () => element.cancelVideoFrameCallback(requestId)
    }, this.abortSignal)

    abortableEffect(() => {
      const element = this.element.value
      const updateAspectRatio = () => (aspectRatio.value = element.videoWidth / element.videoHeight)
      updateAspectRatio()
      element.addEventListener('resize', updateAspectRatio)
      return () => element.removeEventListener('resize', updateAspectRatio)
    }, this.abortSignal)
  }
}

function updateVideoElement(element: HTMLVideoElement, properties: Properties) {
  element.playsInline = true
  element.volume = properties.get('volume') ?? 1
  element.preservesPitch = properties.get('preservesPitch') ?? true
  element.playbackRate = properties.get('playbackRate') ?? 1
  element.muted = properties.get('muted') ?? false
  element.loop = properties.get('loop') ?? false
  element.autoplay = properties.get('autoplay') ?? false
  element.crossOrigin = properties.get('crossOrigin') ?? null
  //update src
  const src = properties.get('inputSrc')
  if (src == null) {
    element.removeAttribute('src')
    element.removeAttribute('srcObject')
    return
  }
  if (typeof src === 'string') {
    element.src = src
  } else {
    element.srcObject = src
  }
}
