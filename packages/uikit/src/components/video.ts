import { ImageProperties } from './image.js'

export type VideoProperties = Omit<ImageProperties, 'src'> & {
  src?: string | HTMLVideoElement
  volume?: number
  preservesPitch?: boolean
  playbackRate?: number
  muted?: boolean
  loop?: boolean
  autoplay?: boolean
}

/**
 * @requires that the element is attached to the dom if "autoplay" is active
 */
export function updateVideoElement(
  element: HTMLVideoElement,
  src: string | HTMLVideoElement | undefined,
  autoplay = false,
  volume = 1,
  preservesPitch = true,
  playbackRate = 1,
  muted = false,
  loop = false,
) {
  const videoElement = src instanceof HTMLVideoElement ? src : element

  videoElement.playsInline = true
  videoElement.volume = volume ?? 1
  videoElement.preservesPitch = preservesPitch ?? true
  videoElement.playbackRate = playbackRate ?? 1
  videoElement.muted = muted ?? false
  videoElement.loop = loop ?? false
  // videoElement.autoplay = autoplay ?? false
  //update src
  if (src == null) {
    videoElement.removeAttribute('src')
    videoElement.removeAttribute('srcObject')
    return
  }
  if (typeof src === 'string') {
    videoElement.src = src
  }
}
