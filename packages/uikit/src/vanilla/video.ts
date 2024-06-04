import { Image } from './image.js'
import { VideoTexture } from 'three'
import { Signal, signal } from '@preact/signals-core'
import { ImageProperties, VideoProperties, updateVideoElement } from '../components/index.js'
import { AllOptionalProperties } from '../properties/index.js'

export class Video extends Image {
  public readonly element: HTMLVideoElement
  private readonly texture: VideoTexture
  private readonly aspectRatio: Signal<number>
  private readonly updateAspectRatio: () => void

  constructor(
    { src, autoplay, volume, preservesPitch, playbackRate, muted, loop, ...rest }: VideoProperties = {},
    defaultProperties?: AllOptionalProperties,
  ) {
    const element = document.createElement('video')
    if (autoplay) {
      document.body.append(element)
    }
    updateVideoElement(element, src, autoplay, volume, preservesPitch, playbackRate, muted, loop)
    const texture = new VideoTexture(element)
    const aspectRatio = signal<number>(1)
    super({ aspectRatio, src: texture, ...rest }, defaultProperties)
    this.element = element
    this.texture = texture
    this.aspectRatio = aspectRatio
    this.updateAspectRatio = () => (aspectRatio.value = this.element.videoWidth / this.element.videoHeight)
    this.updateAspectRatio()
    this.element.addEventListener('resize', this.updateAspectRatio)
  }

  setProperties({
    src,
    autoplay,
    volume,
    preservesPitch,
    playbackRate,
    muted,
    loop,
    ...rest
  }: VideoProperties & ImageProperties): void {
    if (autoplay) {
      this.element.remove()
      document.body.append(this.element)
    }
    updateVideoElement(this.element, src, autoplay, volume, preservesPitch, playbackRate, muted, loop)
    super.setProperties({
      aspectRatio: this.aspectRatio,
      src: this.texture,
      ...rest,
    })
  }

  destroy(): void {
    super.destroy()
    this.texture.dispose()
    this.element.remove()
    this.element.removeEventListener('resize', this.updateAspectRatio)
  }
}
