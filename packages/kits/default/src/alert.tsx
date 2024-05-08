import {
  AllOptionalProperties,
  ComponentInternals,
  Container,
  ContainerProperties,
  DefaultProperties,
} from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef } from 'react'
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

export const Alert: (props: AlertProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  (props, ref) => {
    return (
      <DefaultProperties {...alertVariants[props.variant ?? 'default']}>
        <Container
          flexDirection="column"
          positionType="relative"
          width="100%"
          borderRadius={borderRadius.lg}
          borderWidth={1}
          padding={16}
          ref={ref}
          {...props}
        />
      </DefaultProperties>
    )
  },
)

export type AlertIconProperties = ContainerProperties

export const AlertIcon: (props: AlertIconProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  (props, ref) => {
    return <Container positionLeft={16} positionTop={16} positionType="absolute" ref={ref} {...props} />
  },
)

export type AlertTitleProperties = ContainerProperties

export const AlertTitle: (props: AlertTitleProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <Container marginBottom={4} padding={0} paddingLeft={28} ref={ref} {...props}>
        <DefaultProperties fontWeight="medium" letterSpacing={-0.4} lineHeight="100%">
          {children}
        </DefaultProperties>
      </Container>
    )
  },
)

export type AlertDescriptionProperties = ContainerProperties

export const AlertDescription: (props: AlertDescriptionProperties & RefAttributes<ComponentInternals>) => ReactNode =
  forwardRef(({ children, ...props }, ref) => {
    return (
      <Container paddingLeft={28} ref={ref} {...props}>
        <DefaultProperties lineHeight="162.5%" fontSize={14}>
          {children}
        </DefaultProperties>
      </Container>
    )
  })
