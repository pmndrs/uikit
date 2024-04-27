import { Container, ContainerProperties } from '@react-three/uikit'
import React from 'react'
import { colors } from './theme.js'

export type SeparatorProperties = Omit<ContainerProperties, 'children'> & { orientation?: 'horizontal' | 'vertical' }

export function Separator({ orientation = 'horizontal', ...props }: SeparatorProperties) {
  return (
    <Container
      flexShrink={0}
      backgroundColor={colors.border}
      width={orientation === 'horizontal' ? '100%' : 1}
      height={orientation === 'horizontal' ? 1 : '100%'}
      {...props}
    />
  )
}
