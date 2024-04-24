import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, { ReactNode } from 'react'
import { borderRadius, colors } from './theme.js'

export type CardProperties = ContainerProperties

export function Card({ children, ...props }: CardProperties) {
  return (
    <Container
      flexDirection="column"
      borderRadius={borderRadius.lg}
      borderWidth={1}
      backgroundColor={colors.card}
      {...props}
    >
      <DefaultProperties color={colors.cardForeground}>{children}</DefaultProperties>
    </Container>
  )
}

export type CardHeaderProperties = ContainerProperties

export function CardHeader(props: CardHeaderProperties) {
  return <Container padding={24} flexDirection="column" gap={6} {...props} />
}

export type CardTitleProperties = { children?: ReactNode }

export function CardTitle(props: CardTitleProperties) {
  return <DefaultProperties fontWeight="semi-bold" letterSpacing={-0.4} fontSize={24} lineHeight="100%" {...props} />
}

export type CardDescriptionProperties = { children?: ReactNode }

export function CardDescription(props: CardDescriptionProperties) {
  return <DefaultProperties fontSize={14} lineHeight={20} color={colors.mutedForeground} {...props} />
}

export type CardContentProperties = ContainerProperties

export function CardContent(props: CardContentProperties) {
  return <Container padding={24} paddingTop={0} {...props} />
}

export type CardFooterProperties = ContainerProperties

export function CardFooter(props: CardFooterProperties) {
  return <Container flexDirection="row" alignItems="center" padding={24} paddingTop={0} {...props} />
}
