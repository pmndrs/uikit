import { AllOptionalProperties, Container, DefaultProperties } from '@react-three/uikit'
import React, { ComponentPropsWithoutRef } from 'react'
import { colors } from './theme'

const badgeVariants: {
  [Key in string]: {
    defaultProps?: AllOptionalProperties
    containerProps?: Omit<ComponentPropsWithoutRef<typeof Container>, 'hover'>
    containerHoverProps?: ComponentPropsWithoutRef<typeof Container>['hover']
  }
} = {
  default: {
    defaultProps: {
      color: colors.primaryForeground,
    },
    containerProps: {
      backgroundColor: colors.primary,
    },
    containerHoverProps: {
      backgroundOpacity: 0.8,
    },
  },
  secondary: {
    defaultProps: {
      color: colors.secondaryForeground,
    },
    containerProps: {
      backgroundColor: colors.secondary,
    },
    containerHoverProps: {
      backgroundOpacity: 0.8,
    },
  },
  destructive: {
    defaultProps: {
      color: colors.destructiveForeground,
    },
    containerProps: {
      backgroundColor: colors.destructive,
    },
    containerHoverProps: {
      backgroundOpacity: 0.8,
    },
  },
  outline: {},
}

export function Badge({
  children,
  variant = 'default',
  hover,
  ...props
}: ComponentPropsWithoutRef<typeof Container> & { variant?: keyof typeof badgeVariants }) {
  const { containerProps, defaultProps, containerHoverProps } = badgeVariants[variant]
  return (
    <Container
      borderRadius={1000}
      border={1}
      paddingX={10}
      paddingY={2}
      hover={{ ...containerHoverProps, ...hover }}
      {...containerProps}
      {...props}
    >
      <DefaultProperties fontSize={12} lineHeight={1.3333} fontWeight="semi-bold" {...defaultProps}>
        {children}
      </DefaultProperties>
    </Container>
  )
}
