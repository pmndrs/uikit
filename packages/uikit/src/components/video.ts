import { ImageOutputProperties, Image } from './image.js'
import { SRGBColorSpace, VideoTexture } from 'three'
import { computed, Signal, signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { BaseOutputProperties, InputProperties, Properties } from '../properties/index.js'
import { abortableEffect, loadResourceWithParams } from '../utils.js'
import { RenderContext } from '../context.js'

export type VideoSrc = HTMLVideoElement['src'] | HTMLVideoElement['srcObject'] | HTMLVideoElement

export type VideoOutputProperties<EM extends ThreeEventMap> = ImageOutputProperties<EM, VideoSrc> &
  Omit<HTMLVideoElement, 'src' | 'srcObject' | 'playsInline'>

export type VideoProperties<EM extends ThreeEventMap> = InputProperties<VideoOutputProperties<EM>>

export class Video<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Image<T, EM, VideoOutputProperties<EM>> {
  readonly element = signal<HTMLVideoElement | undefined>()

  constructor(
    inputProperties?: VideoProperties<EM>,
    initialClasses?: Array<InputProperties<BaseOutputProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext, false)

    const srcIsElement = computed(() => this.properties.value.src instanceof HTMLVideoElement)
    const notYetLoadedElement = computed(() => {
      if (srcIsElement.value) {
        this.properties.value.src as HTMLVideoElement
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
      const src = this.properties.value.src
      const element = notYetLoadedElement.value
      if (src instanceof HTMLVideoElement || element == null) {
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
      //update src

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
