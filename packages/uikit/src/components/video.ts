import { ImageProperties } from './image.js'

export type VideoProperties = Omit<ImageProperties, 'src'> & InternalVideoProperties

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
}

export function updateVideoElement(
  element: HTMLVideoElement,
  { src, autoplay, loop, muted, playbackRate, preservesPitch, volume }: InternalVideoProperties,
) {
  if (src instanceof HTMLElement) {
    return
  }

  if (autoplay) {
    element.remove()
    document.body.append(element)
    element.style.position = 'absolute'
    element.style.width = '1px'
    element.style.zIndex = '-1000'
    element.style.top = '0px'
    element.style.left = '0px'
  }
  element.playsInline = true
  element.volume = volume ?? 1
  element.preservesPitch = preservesPitch ?? true
  element.playbackRate = playbackRate ?? 1
  element.muted = muted ?? false
  element.loop = loop ?? false
  element.autoplay = autoplay ?? false
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
