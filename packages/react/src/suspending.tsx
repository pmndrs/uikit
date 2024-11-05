import { ReactNode, RefAttributes, forwardRef } from 'react'
import { Image, ImageProperties } from './image.js'
import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'
import { ComponentInternals } from './ref.js'

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
