import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo } from 'react'
import { Image, ImageProperties } from './image.js'
import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'
import { ComponentInternals } from './ref.js'
import { Video, VideoProperties, VideoRef } from './video.js'
import { suspend } from 'suspend-react'

export type SuspendingImageProperties = ImageProperties & {
  src: string
  children?: ReactNode
}

export type SuspendingImageRef = ComponentInternals<Omit<ImageProperties, 'src'>>

/**
 * be aware that this component does not dispose the loaded texture
 */
export const SuspendingImage: (props: SuspendingImageProperties & RefAttributes<SuspendingImageRef>) => ReactNode =
  forwardRef(({ src, ...props }, ref) => {
    const texture = useLoader(TextureLoader, src)
    texture.colorSpace = SRGBColorSpace
    texture.matrixAutoUpdate = false
    return <Image ref={ref} src={texture} {...props} />
  })

export type SuspendingVideoProperties = VideoProperties & {
  src: string
  children?: ReactNode
}

const loadVideoElementSymbol = Symbol('load-video-element')

export const SuspendingVideo: (props: SuspendingVideoProperties & RefAttributes<VideoRef>) => ReactNode = forwardRef(
  ({ src, ...props }, ref) => {
    const element = suspend(loadVideoElement, [src, loadVideoElementSymbol])
    return <Video ref={ref} src={element} {...props} />
  },
)

function loadVideoElement(src: string): Promise<HTMLVideoElement> {
  const result = document.createElement('video')
  result.style.position = 'absolute'
  result.style.width = '1px'
  result.style.zIndex = '-1000'
  result.style.top = '0px'
  result.style.left = '0px'
  result.src = src
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
