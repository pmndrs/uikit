import { Image, ImageProperties } from '@react-three/uikit'
import React from 'react'

export type AvatarProperties = ImageProperties

export function Avatar(props: AvatarProperties) {
  return <Image width={40} height={40} flexShrink={0} aspectRatio={1} objectFit="cover" borderRadius={20} {...props} />
}
