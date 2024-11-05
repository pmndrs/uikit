import { Image, ImageProperties, ImageRef } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef } from 'react'

export type AvatarProperties = ImageProperties

export const Avatar: (props: AvatarProperties & RefAttributes<ImageRef>) => ReactNode = forwardRef((props, ref) => {
  return (
    <Image
      width={40}
      height={40}
      flexShrink={0}
      aspectRatio={1}
      objectFit="cover"
      borderRadius={20}
      ref={ref}
      {...props}
    />
  )
})
