import { ComponentPropsWithoutRef } from 'react'
import { Image, PlatformConstants } from './image.js'
import { useLoader } from '@react-three/fiber'

export function SuspendingImage({
  src,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Image>, 'src'> & { src: string }) {
  const texture = useLoader(PlatformConstants.TextureLoader, src)
  return <Image src={texture} {...props} />
}
