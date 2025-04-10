/*import { Image } from './image.js'
import { VideoTexture } from 'three'
import { Signal, effect, signal } from '@preact/signals-core'
import { setupVideoElementInvalidation, updateVideoElement, VideoProperties } from '../components/index.js'
import { ThreeEventMap } from '../events.js'
import { abortableEffect } from '../utils.js'

export class Video<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Image<T> {
  public element: HTMLVideoElement
  private readonly texture: VideoTexture
  private readonly aspectRatio: Signal<number>
  private readonly updateAspectRatio: () => void
  private unsubscribeInvalidate: () => void

  private abortController = new AbortController()

  constructor({ src, ...rest }: VideoProperties<EM> = {}) {
    const element = src instanceof HTMLVideoElement ? src : document.createElement('video')
    updateVideoElement(element, rest)
    const texture = new VideoTexture(element)
    texture.needsUpdate = true
    const aspectRatio = signal<number>(1)
    super({ aspectRatio, ...rest, src: texture })

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
    this.element.addEventListener('resize', this.updateAspectRatio, { signal: this.abortController.signal })
  }

  setProperties(properties?: VideoProperties<EM>): void {
    updateVideoElement(this.element, properties)
    super.setProperties({
      aspectRatio: this.aspectRatio,
      ...properties,
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
*/
