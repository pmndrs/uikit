import { Container } from '@react-three/uikit'
import { ComponentPropsWithoutRef } from 'react'
import { colors } from './theme.js'

export function Separator({
  orientation = 'horizontal',
  ...props
}: { orientation?: 'horizontal' | 'vertical' } & Omit<ComponentPropsWithoutRef<typeof Container>, 'children'>) {
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
