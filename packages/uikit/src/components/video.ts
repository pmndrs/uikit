import { ImageOutProperties, Image } from './image.js'
import { SRGBColorSpace, VideoTexture } from 'three'
import { computed, signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { BaseOutProperties, InProperties } from '../properties/index.js'
import { abortableEffect, loadResourceWithParams } from '../utils.js'
import { RenderContext } from '../context.js'

export type VideoSrc = HTMLVideoElement['src'] | HTMLVideoElement['srcObject'] | HTMLVideoElement

export type VideoOutProperties<EM extends ThreeEventMap> = ImageOutProperties<EM, VideoSrc> &
  Omit<HTMLVideoElement, 'width' | 'height' | 'src' | 'srcObject' | 'playsInline' | 'focus' | 'active'>

export type VideoProperties<EM extends ThreeEventMap> = InProperties<VideoOutProperties<EM>>

export class Video<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends VideoOutProperties<EM> = VideoOutProperties<EM>,
> extends Image<T, EM, OutProperties> {
  readonly element = signal<HTMLVideoElement | undefined>()

  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultsOverrides?: InProperties<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      loadTexture: false,
      ...config,
    })

    const srcIsElement = computed(() => this.properties.value.src instanceof HTMLVideoElement)
    const notYetLoadedElement = computed(() => {
      if (srcIsElement.value) {
        return this.properties.value.src as HTMLVideoElement
      }
      const element = document.createElement('video')
      element.style.position = 'absolute'
      element.style.width = '1px'
      element.style.zIndex = '-1000'
      element.style.top = '0px'
      element.style.left = '0px'
      return element
    })
    abortableEffect(() => {
      const element = notYetLoadedElement.value
      if (element == null) {
        return
      }
      element.playsInline = true
      element.volume = this.properties.value.volume ?? 1
      element.preservesPitch = this.properties.value.preservesPitch ?? true
      element.playbackRate = this.properties.value.playbackRate ?? 1
      element.muted = this.properties.value.muted ?? false
      element.loop = this.properties.value.loop ?? false
      element.autoplay = this.properties.value.autoplay ?? false
      element.crossOrigin = this.properties.value.crossOrigin ?? null
      const src = this.properties.value.src
      if (src instanceof HTMLVideoElement) {
        return
      }
      updateVideoElementSrc(element, src)
    }, this.abortSignal)
    abortableEffect(() => {
      const element = notYetLoadedElement.value
      if (srcIsElement.value || element == null) {
        return
      }
      document.body.appendChild(element)
      return () => element.remove()
    }, this.abortSignal)
    loadResourceWithParams(this.element, loadVideoElement, () => {}, this.abortSignal, notYetLoadedElement)

    abortableEffect(() => {
      const element = this.element.value
      if (element == null) {
        return
      }
      const updateTexture = () => {
        const texture = new VideoTexture(element)
        texture.colorSpace = SRGBColorSpace
        texture.needsUpdate = true
        this.texture.value = texture
      }
      updateTexture()
      element.addEventListener('resize', updateTexture)
      return () => element.removeEventListener('resize', updateTexture)
    }, this.abortSignal)

    abortableEffect(() => {
      const { requestRender } = this.root.value
      const element = this.element.value
      if (requestRender == null || element == null) {
        return
      }
      let requestId: number
      const callback = () => {
        requestRender()
        requestId = element.requestVideoFrameCallback(callback)
      }
      requestId = element.requestVideoFrameCallback(callback)
      return () => element.cancelVideoFrameCallback(requestId)
    }, this.abortSignal)
  }
}

async function loadVideoElement(element: HTMLVideoElement | undefined) {
  if (element == null) {
    return undefined
  }
  if (element.readyState < HTMLMediaElement.HAVE_METADATA) {
    await new Promise((resolve) => (element.onloadedmetadata = resolve))
  }
  return element
}

export function updateVideoElementSrc(element: HTMLVideoElement, src: Exclude<VideoSrc, HTMLVideoElement> | undefined) {
  if (src == null) {
    element.removeAttribute('src')
    element.removeAttribute('srcObject')
    return
  }
  if (typeof src === 'string') {
    element.src = src
    return
  }
  element.srcObject = src
}
