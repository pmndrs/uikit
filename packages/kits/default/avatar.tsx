import { Image } from '@react-three/uikit'
import React from 'react'

export function Avatar(props: React.ComponentPropsWithoutRef<typeof Image>) {
  return <Image width={40} height={40} flexShrink={0} aspectRatio={1} fit="cover" borderRadius={20} {...props} />
}
