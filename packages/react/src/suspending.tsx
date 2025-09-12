import { ReactNode, RefAttributes, forwardRef, useEffect } from 'react'
import { Video, VanillaVideo, Image, VanillaImage } from './index.js'
import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'
import { suspend } from 'suspend-react'
import {
  ImageOutProperties,
  InProperties,
  ThreeEventMap,
  updateVideoElementSrc,
  VideoOutProperties,
  VideoSrc,
} from '@pmndrs/uikit'

export type SuspendingImageProperties = InProperties<Omit<ImageOutProperties<ThreeEventMap, never>, 'src'>> & {
  src: string
}

/**
 * be aware that this component does not dispose the loaded texture
 */
export const SuspendingImage: (props: SuspendingImageProperties & RefAttributes<VanillaImage>) => ReactNode =
  forwardRef(({ src, ...props }, ref) => {
    const texture = useLoader(TextureLoader, src)
    texture.colorSpace = SRGBColorSpace
    texture.matrixAutoUpdate = false
    return <Image ref={ref} src={texture} {...props} />
  })

export type SuspendingVideoProperties = InProperties<Omit<VideoOutProperties<ThreeEventMap>, 'src'>> & {
  src: Exclude<VideoSrc, HTMLVideoElement>
}

const loadVideoElementSymbol = Symbol('load-video-element')

export const SuspendingVideo: (props: SuspendingVideoProperties & RefAttributes<VanillaVideo>) => ReactNode =
  forwardRef((props, ref) => {
    const element = suspend(loadVideoElement, [loadVideoElementSymbol])
    updateVideoElementSrc(element, props.src)
    // Need to append the element to the document, so auto play works.
    useEffect(() => {
      document.body.appendChild(element)
      return () => element.remove()
    }, [element])
    return <Video ref={ref} {...props} src={element} />
  })

function loadVideoElement(): Promise<HTMLVideoElement> {
  const result = document.createElement('video')
  result.style.position = 'absolute'
  result.style.width = '1px'
  result.style.zIndex = '-1000'
  result.style.top = '0px'
  result.style.left = '0px'
  return new Promise((resolve) => {
    const handleLoadedData = () => {
      result.removeEventListener('loadeddata', handleLoadedData)
      resolve(result)
    }

    // Check if the video already has data loaded
    if (result.readyState >= 2) {
      resolve(result)
    } else {
      result.addEventListener('loadeddata', handleLoadedData)
    }
  })
}
