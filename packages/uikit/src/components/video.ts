/*import { ThreeEventMap } from '../events.js'
import { AllProperties, Properties } from '../properties/index.js'
import { abortableEffect } from '../utils.js'
import type { createImageState, ImageFit } from './image.js'

export type VideoProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, AdditionalVideoProperties>

export type AdditionalVideoProperties = {
  objectFit?: ImageFit
  keepAspectRatio?: boolean
  src: HTMLVideoElement['src'] | HTMLVideoElement['srcObject']
  html: Omit<HTMLVideoElement, 'src' | 'playsInline' | 'style'>
}

/**
 * @requires that the element is attached to the document and therefore should be hidden (position = 'absolute', width = '1px', zIndex = '-1000', top = '0px', left = '0px')
 *
export function updateVideoElement(
  element: HTMLVideoElement,
  properties: ReturnType<typeof createImageState>['properties'],
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
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
  }, abortSignal)
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
*/
