import { DefaultProperties } from '@react-three/uikit'
import React, { ReactNode } from 'react'

export type LabelProperties = { children?: ReactNode; disabled?: boolean }

export function Label({ disabled, ...props }: LabelProperties) {
  return (
    <DefaultProperties
      fontWeight="medium"
      fontSize={14}
      lineHeight="100%"
      opacity={disabled ? 0.7 : undefined}
      {...props}
    />
  )
}
