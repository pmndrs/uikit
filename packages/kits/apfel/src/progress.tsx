import { ComponentInternals, Container, ContainerProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef } from 'react'
import { colors } from './theme.js'

export type ProgressProperties = ContainerProperties & {
  value?: number
}

export const Progress: (props: ProgressProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ value = 0, ...props }, ref) => {
    return (
      <Container
        width="100%"
        height={4}
        borderRadius={2}
        backgroundColor={colors.foreground}
        backgroundOpacity={0.2}
        ref={ref}
        {...props}
      >
        <Container
          backgroundColor={colors.foreground}
          backgroundOpacity={0.8}
          minWidth={4}
          width={`${value * 100}%`}
          height={4}
          borderRadius={2}
        />
      </Container>
    )
  },
)
