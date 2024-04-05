import { ReactNode, RefAttributes, forwardRef } from 'react'
import { Image } from './image.js'
import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'
import { ComponentInternals } from './ref.js'
import { EventHandlers, ImageProperties } from '@pmndrs/uikit/internals'

export const SuspendingImage: (
  props: ImageProperties &
    EventHandlers &
    RefAttributes<ComponentInternals<ImageProperties>> & {
      src: string
      children?: ReactNode
    },
) => ReactNode = forwardRef(({ src, ...props }, ref) => {
  const texture = useLoader(TextureLoader, src)
  texture.colorSpace = SRGBColorSpace
  texture.matrixAutoUpdate = false
  return <Image ref={ref} src={texture} {...props} />
})
