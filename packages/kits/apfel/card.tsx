import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React from 'react'
import { GlassMaterial, colors } from './theme.js'

export function Card({ children, ...props }: ContainerProperties) {
  return (
    <Container
      backgroundColor={colors.card}
      backgroundOpacity={0.8}
      borderColor={colors.card}
      borderOpacity={0.8}
      borderWidth={4}
      borderBend={0.3}
      panelMaterialClass={GlassMaterial}
      borderRadius={32}
      {...props}
    >
      <DefaultProperties color={colors.cardForeground}>{children}</DefaultProperties>
    </Container>
  )
}
