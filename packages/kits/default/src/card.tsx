import { ContainerRef, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef } from 'react'
import { borderRadius, colors } from './theme.js'

export type CardProperties = ContainerProperties

export const Card: (props: CardProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <Container
        flexDirection="column"
        borderRadius={borderRadius.lg}
        borderWidth={1}
        backgroundColor={colors.card}
        ref={ref}
        {...props}
      >
        <DefaultProperties color={colors.cardForeground}>{children}</DefaultProperties>
      </Container>
    )
  },
)

export type CardHeaderProperties = ContainerProperties

export const CardHeader: (props: CardHeaderProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  (props, ref) => {
    return <Container padding={24} flexDirection="column" gap={6} ref={ref} {...props} />
  },
)

export type CardTitleProperties = { children?: ReactNode }

export function CardTitle(props: CardTitleProperties) {
  return <DefaultProperties fontWeight="semi-bold" letterSpacing={-0.4} fontSize={24} lineHeight="100%" {...props} />
}

export type CardDescriptionProperties = { children?: ReactNode }

export function CardDescription(props: CardDescriptionProperties) {
  return <DefaultProperties fontSize={14} lineHeight={20} color={colors.mutedForeground} {...props} />
}

export type CardContentProperties = ContainerProperties

export const CardContent: (props: CardContentProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  (props, ref) => {
    return <Container padding={24} paddingTop={0} ref={ref} {...props} />
  },
)

export type CardFooterProperties = ContainerProperties

export const CardFooter: (props: CardFooterProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  (props, ref) => {
    return <Container flexDirection="row" alignItems="center" padding={24} paddingTop={0} ref={ref} {...props} />
  },
)
