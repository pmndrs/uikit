import { AllOptionalProperties, Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef } from 'react'
import { colors } from './defaults.js'

const buttonVariants = {
  default: {
    containerProps: {
      backgroundColor: colors.primary,
      hover: {
        backgroundOpacity: 0.9,
      },
    },
    defaultProps: {
      color: colors.primaryForeground,
    },
  },
  destructive: {
    containerProps: {
      backgroundColor: colors.destructive,
      hover: {
        backgroundOpacity: 0.9,
      },
    },
    defaultProps: {
      color: colors.destructiveForeground,
    },
  },
  outline: {
    containerProps: {
      border: 1,
      borderColor: colors.input,
      backgroundColor: colors.background,
      hover: {
        backgroundColor: colors.accent,
      },
    },
    defaultProps: {},
  }, //TODO: hover:text-accent-foreground",
  secondary: {
    containerProps: {
      backgroundColor: colors.secondary,
      hover: {
        backgroundOpacity: 0.8,
      },
    },
    defaultProps: {
      color: colors.secondaryForeground,
    },
  },
  ghost: {
    containerProps: {
      hover: {
        backgroundColor: colors.accent,
      },
    },
    defaultProps: {
      hover: {},
    },
  }, // TODO: hover:text-accent-foreground",
  link: {
    containerProps: {},
    defaultProps: {
      color: colors.primary,
    },
  }, //TODO: underline-offset-4 hover:underline",
} satisfies {
  [Key in string]: {
    containerProps: ComponentPropsWithoutRef<typeof Container>
    defaultProps: AllOptionalProperties
  }
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
  ...props
}: ComponentPropsWithoutRef<typeof Container> & {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  disabled?: boolean
}) {
  const { containerProps, defaultProps } = buttonVariants[variant]
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
      {...props}
    >
      <DefaultProperties
        fontSize={14}
        lineHeight={1.43}
        wordBreak="keep-all"
        {...defaultProps}
        opacity={disabled ? 0.5 : undefined}
      >
        {children}
      </DefaultProperties>
    </Container>
  )
}
