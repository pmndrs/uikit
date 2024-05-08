import {
  ComponentInternals,
  Container,
  ContainerProperties,
  DefaultProperties,
  DefaultPropertiesProperties,
} from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef } from 'react'
import { colors } from './theme.js'

const badgeVariants = {
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

export type BadgeProperties = ContainerProperties & { variant?: keyof typeof badgeVariants }

export const Badge: (props: BadgeProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ children, variant = 'default', hover, ...props }, ref) => {
    const {
      containerProps,
      defaultProps,
      containerHoverProps,
    }: {
      defaultProps?: DefaultPropertiesProperties
      containerProps?: Omit<ContainerProperties, 'hover'>
      containerHoverProps?: ContainerProperties['hover']
    } = badgeVariants[variant]
    return (
      <Container
        borderRadius={1000}
        borderWidth={1}
        paddingX={10}
        paddingY={2}
        hover={{ ...containerHoverProps, ...hover }}
        ref={ref}
        {...containerProps}
        {...props}
      >
        <DefaultProperties fontSize={12} lineHeight={16} fontWeight="semi-bold" {...defaultProps}>
          {children}
        </DefaultProperties>
      </Container>
    )
  },
)
