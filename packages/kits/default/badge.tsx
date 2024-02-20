import { AllOptionalProperties, Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef } from 'react'
import { colors } from './defaults.js'

const badgeVariants = {
  default: {
    defaultProps: {
      color: colors.primaryForeground,
    },
    containerProps: {
      backgroundColor: colors.primary,
      hover: {
        backgroundOpacity: 0.8,
      },
    },
  },
  secondary: {
    defaultProps: {
      color: colors.secondaryForeground,
    },
    containerProps: {
      backgroundColor: colors.secondary,
      hover: {
        backgroundOpacity: 0.8,
      },
    },
  },
  destructive: {
    defaultProps: {
      color: colors.destructiveForeground,
    },
    containerProps: {
      backgroundColor: colors.destructive,
      hover: {
        backgroundOpacity: 0.8,
      },
    },
  },
  outline: {
    defaultProps: {},
    containerProps: {},
  },
} satisfies {
  [Key in string]: {
    defaultProps: AllOptionalProperties
    containerProps: ComponentPropsWithoutRef<typeof Container>
  }
}

export function Badge({
  children,
  variant = 'default',
  ...props
}: ComponentPropsWithoutRef<typeof Container> & { variant?: keyof typeof badgeVariants }) {
  const { containerProps, defaultProps } = badgeVariants[variant]
  return (
    <Container borderRadius={1000} border={1} paddingX={10} paddingY={2} {...containerProps} {...props}>
      <DefaultProperties {...defaultProps} fontSize={12} lineHeight={1.3333}>
        {children}
      </DefaultProperties>
    </Container>
  )
}
