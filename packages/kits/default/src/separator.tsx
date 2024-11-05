import { ContainerRef, Container, ContainerProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef } from 'react'
import { colors } from './theme.js'

export type SeparatorProperties = Omit<ContainerProperties, 'children'> & { orientation?: 'horizontal' | 'vertical' }

export const Separator: (props: SeparatorProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  ({ orientation = 'horizontal', ...props }, ref) => {
    return (
      <Container
        flexShrink={0}
        backgroundColor={colors.border}
        width={orientation === 'horizontal' ? '100%' : 1}
        height={orientation === 'horizontal' ? 1 : '100%'}
        ref={ref}
        {...props}
      />
    )
  },
)
