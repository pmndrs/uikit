import { ComponentInternals, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef } from 'react'
import { GlassMaterial, colors } from './theme.js'

export type CardProperties = ContainerProperties

export const Card: (props: CardProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <Container
        backgroundColor={colors.card}
        backgroundOpacity={0.8}
        borderColor={colors.card}
        borderOpacity={0}
        borderWidth={4}
        borderBend={0.3}
        panelMaterialClass={GlassMaterial}
        borderRadius={32}
        ref={ref}
        {...props}
      >
        <DefaultProperties color={colors.cardForeground}>{children}</DefaultProperties>
      </Container>
    )
  },
)
