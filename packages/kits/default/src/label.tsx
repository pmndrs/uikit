import { ComponentInternals, DefaultProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef } from 'react'

export type LabelProperties = { children?: ReactNode; disabled?: boolean }

export const Label: (props: LabelProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ disabled, ...props }, ref) => {
    return (
      <DefaultProperties
        fontWeight="medium"
        fontSize={14}
        lineHeight="100%"
        opacity={disabled ? 0.7 : undefined}
        ref={ref}
        {...props}
      />
    )
  },
)
