import { Image } from './image.js'
import { VideoTexture } from 'three'
import { Signal, effect, signal } from '@preact/signals-core'
import {
  ImageProperties,
  VideoProperties,
  setupVideoElementInvalidation,
  updateVideoElement,
} from '../components/index.js'
import { AllOptionalProperties } from '../properties/index.js'

export class Video extends Image {
  public element: HTMLVideoElement
  private readonly texture: VideoTexture
  private readonly aspectRatio: Signal<number>
  private readonly updateAspectRatio: () => void
  private unsubscribeInvalidate: () => void

  constructor(props: VideoProperties = {}, defaultProperties?: AllOptionalProperties) {
    const element = props.src instanceof HTMLVideoElement ? props.src : document.createElement('video')
    updateVideoElement(element, props)
    const texture = new VideoTexture(element)
    const aspectRatio = signal<number>(1)
    super({ aspectRatio, ...props, src: texture }, defaultProperties)

    this.unsubscribeInvalidate = effect(() => {
      const root = this.parentContextSignal.value?.value?.root
      if (root == null) {
        return
      }
      return setupVideoElementInvalidation(element, root.requestRender)
    })

    this.element = element
    this.texture = texture
    this.aspectRatio = aspectRatio
    this.updateAspectRatio = () => (aspectRatio.value = this.element.videoWidth / this.element.videoHeight)
    this.updateAspectRatio()
    this.element.addEventListener('resize', this.updateAspectRatio)
  }

  setProperties(props: VideoProperties & ImageProperties): void {
    updateVideoElement(this.element, props)
    super.setProperties({
      aspectRatio: this.aspectRatio,
      ...props,
      src: this.texture,
    })
  }

  destroy(): void {
    super.destroy()
    this.unsubscribeInvalidate()
    this.texture.dispose()
    this.element.remove()
    this.element.removeEventListener('resize', this.updateAspectRatio)
  }
}
