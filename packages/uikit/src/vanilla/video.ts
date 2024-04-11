import { Image } from './image.js'
import { VideoTexture } from 'three'
import { ImageProperties } from '../index.js'
import { Signal, signal } from '@preact/signals-core'

export class VideoContainer extends Image {
  public readonly element: HTMLVideoElement
  private readonly texture: VideoTexture
  private readonly aspectRatio: Signal<number>
  private readonly updateAspectRatio: () => void

  constructor(
    src: string | MediaStream,
    volume?: number,
    preservesPitch?: boolean,
    playbackRate?: number,
    muted?: boolean,
    loop?: boolean,
    autoplay?: boolean,
    properties?: ImageProperties,
    defaultProperties?: ImageProperties,
  ) {
    const element = document.createElement('video')
    const texture = new VideoTexture(element)
    const aspectRatio = signal<number>(1)
    super(texture, { aspectRatio, ...properties }, defaultProperties)
    this.element = element
    this.texture = texture
    this.aspectRatio = aspectRatio
    if (autoplay) {
      this.element.style.position = 'absolute'
      this.element.style.width = '1px'
      this.element.style.zIndex = '-1000'
      this.element.style.top = '0px'
      this.element.style.left = '0px'
      document.body.append(this.element)
    }
    this.element.playsInline = true
    this.element.volume = volume ?? 1
    this.element.preservesPitch = preservesPitch ?? true
    this.element.playbackRate = playbackRate ?? 1
    this.element.muted = muted ?? false
    this.element.loop = loop ?? false
    this.element.autoplay = autoplay ?? false
    if (typeof src === 'string') {
      this.element.src = src
    } else {
      this.element.srcObject = src
    }
    this.updateAspectRatio = () => (aspectRatio.value = this.element.videoWidth / this.element.videoHeight)
    this.updateAspectRatio()
    this.element.addEventListener('resize', this.updateAspectRatio)
  }

  setProperties(properties?: ImageProperties): void {
    super.setProperties({
      aspectRatio: this.aspectRatio,
      ...properties,
    })
  }

  destroy(): void {
    super.destroy()
    this.texture.dispose()
    this.element.remove()
    this.element.removeEventListener('resize', this.updateAspectRatio)
  }
}
