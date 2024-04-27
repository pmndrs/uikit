import { AllOptionalProperties, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React from 'react'
import { borderRadius, colors } from './theme.js'

const alertVariants = {
  default: {},
  destructive: {
    borderColor: colors.destructive,
    borderOpacity: 0.5,
    color: colors.destructive,
  },
} satisfies { [Key in string]: AllOptionalProperties }

export type AlertProperties = ContainerProperties & { variant?: keyof typeof alertVariants }

export function Alert(props: AlertProperties) {
  return (
    <DefaultProperties {...alertVariants[props.variant ?? 'default']}>
      <Container
        flexDirection="column"
        positionType="relative"
        width="100%"
        borderRadius={borderRadius.lg}
        borderWidth={1}
        padding={16}
        {...props}
      />
    </DefaultProperties>
  )
}

export type AlertIconProperties = ContainerProperties

export function AlertIcon(props: AlertIconProperties) {
  return <Container positionLeft={16} positionTop={16} positionType="absolute" {...props} />
}

export type AlertTitleProperties = ContainerProperties

export function AlertTitle({ children, ...props }: AlertTitleProperties) {
  return (
    <Container marginBottom={4} padding={0} paddingLeft={28} {...props}>
      <DefaultProperties fontWeight="medium" letterSpacing={-0.4} lineHeight="100%">
        {children}
      </DefaultProperties>
    </Container>
  )
}

export type AlertDescriptionProperties = ContainerProperties

export function AlertDescription({ children, ...props }: AlertDescriptionProperties) {
  return (
    <Container paddingLeft={28} {...props}>
      <DefaultProperties lineHeight="162.5%" fontSize={14}>
        {children}
      </DefaultProperties>
    </Container>
  )
}
