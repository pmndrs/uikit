import { ComponentPropsWithoutRef } from 'react'
import { Image } from './image.js'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

export function SuspendingImage({
  src,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Image>, 'src'> & { src: string }) {
  const texture = useLoader(TextureLoader, src)
  return <Image src={texture} {...props} />
}
