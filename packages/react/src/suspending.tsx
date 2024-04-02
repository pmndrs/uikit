import { ComponentPropsWithoutRef } from 'react'
import { Image } from './image.js'
import { useLoader } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'

export function SuspendingImage({
  src,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Image>, 'src'> & { src: string }) {
  const texture = useLoader(TextureLoader, src)
  texture.colorSpace = SRGBColorSpace
  texture.matrixAutoUpdate = false
  return <Image src={texture} {...props} />
}
