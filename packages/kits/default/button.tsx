import { AllOptionalProperties, Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef } from 'react'
import { colors } from './theme'

const buttonVariants = {
  default: {
    containerHoverProps: {
      backgroundOpacity: 0.9,
    },
    containerProps: {
      backgroundColor: colors.primary,
    },
    defaultProps: {
      color: colors.primaryForeground,
    },
  },
  destructive: {
    containerHoverProps: {
      backgroundOpacity: 0.9,
    },
    containerProps: {
      backgroundColor: colors.destructive,
    },
    defaultProps: {
      color: colors.destructiveForeground,
    },
  },
  outline: {
    containerHoverProps: {
      backgroundColor: colors.accent,
    },
    containerProps: {
      border: 1,
      borderColor: colors.input,
      backgroundColor: colors.background,
    },
  }, //TODO: hover:text-accent-foreground",
  secondary: {
    containerHoverProps: {
      backgroundOpacity: 0.8,
    },
    containerProps: {
      backgroundColor: colors.secondary,
    },
    defaultProps: {
      color: colors.secondaryForeground,
    },
  },
  ghost: {
    containerHoverProps: {
      backgroundColor: colors.accent,
    },
    defaultProps: {},
  }, // TODO: hover:text-accent-foreground",
  link: {
    containerProps: {},
    defaultProps: {
      color: colors.primary,
    },
  }, //TODO: underline-offset-4 hover:underline",
}

const buttonSizes = {
  default: { height: 40, paddingX: 16, paddingY: 8 },
  sm: { height: 36, paddingX: 12 },
  lg: { height: 42, paddingX: 32 },
  icon: { height: 40, width: 40 },
} satisfies { [Key in string]: ComponentPropsWithoutRef<typeof Container> }

export function Button({
  children,
  variant = 'default',
  size = 'default',
  disabled = false,
  hover,
  ...props
}: ComponentPropsWithoutRef<typeof Container> & {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  disabled?: boolean
}) {
  const { containerProps, defaultProps, containerHoverProps } = buttonVariants[variant] as {
    [Key in string]: {
      containerHoverProps?: ComponentPropsWithoutRef<typeof Container>['hover']
      containerProps?: Omit<ComponentPropsWithoutRef<typeof Container>, 'hover'>
      defaultProps?: AllOptionalProperties
    }
  }
  const sizeProps = buttonSizes[size]

  return (
    <Container
      borderRadius={6}
      alignItems="center"
      justifyContent="center"
      {...containerProps}
      {...sizeProps}
      borderOpacity={disabled ? 0.5 : undefined}
      backgroundOpacity={disabled ? 0.5 : undefined}
      cursor={disabled ? undefined : 'pointer'}
      flexDirection="row"
      hover={{
        ...containerHoverProps,
        ...hover,
      }}
      {...props}
    >
      <DefaultProperties
        fontSize={14}
        lineHeight={1.43}
        fontWeight="medium"
        wordBreak="keep-all"
        {...defaultProps}
        opacity={disabled ? 0.5 : undefined}
      >
        {children}
      </DefaultProperties>
    </Container>
  )
}
