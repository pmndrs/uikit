import { EventHandlers, ThreeEventMap } from '../events.js'
import { ImageProperties } from './image.js'

export type VideoProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<ImageProperties<EM>, 'src'> &
  InternalVideoProperties

type InternalVideoProperties = {
  /**
   * when a HtmlVideoElement is provided to src, properties like `volume`, ... are not applied
   */
  src?: string | MediaStream | HTMLVideoElement
  volume?: number
  preservesPitch?: boolean
  playbackRate?: number
  muted?: boolean
  loop?: boolean
  autoplay?: boolean
  crossOrigin?: string
}

/**
 * @requires that the element is attached to the document and therefore should be hidden (position = 'absolute', width = '1px', zIndex = '-1000', top = '0px', left = '0px')
 */
export function updateVideoElement(
  element: HTMLVideoElement,
  { src, autoplay, loop, muted, playbackRate, preservesPitch, volume, crossOrigin }: InternalVideoProperties,
) {
  if (src instanceof HTMLElement) {
    return
  }

  element.playsInline = true
  element.volume = volume ?? 1
  element.preservesPitch = preservesPitch ?? true
  element.playbackRate = playbackRate ?? 1
  element.muted = muted ?? false
  element.loop = loop ?? false
  element.autoplay = autoplay ?? false
  element.crossOrigin = crossOrigin ?? null
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
}

export function setupVideoElementInvalidation(element: HTMLVideoElement, invalidate: () => void) {
  let requestId: number
  const callback = () => {
    invalidate()
    requestId = element.requestVideoFrameCallback(callback)
  }
  requestId = element.requestVideoFrameCallback(callback)
  return () => element.cancelVideoFrameCallback(requestId)
}
