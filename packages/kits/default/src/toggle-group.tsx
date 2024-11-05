import { ContainerRef, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, createContext, forwardRef, useContext, useState } from 'react'
import { borderRadius, colors } from './theme.js'

const toggleVariants = {
  default: {},
  outline: {
    containerProps: {
      borderWidth: 1,
      borderColor: colors.input,
    },
    containerHoverProps: {
      backgroundColor: colors.accent,
    },
  },
  //TODO: hover:text-accent-foreground
}

const toggleSizes = {
  default: { height: 40, paddingX: 12 },
  sm: { height: 36, paddingX: 10 },
  lg: { height: 44, paddingX: 20 },
} satisfies { [Key in string]: ContainerProperties }

const ToggleGroupContext = createContext<{
  size: keyof typeof toggleSizes
  variant: keyof typeof toggleVariants
}>({ size: 'default', variant: 'default' })

export type ToggleGroupProperties = ContainerProperties & {
  variant?: keyof typeof toggleVariants
  size?: keyof typeof toggleSizes
}

export const ToggleGroup: (props: ToggleGroupProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  ({ children, size = 'default', variant = 'default', ...props }, ref) => {
    return (
      <Container flexDirection="row" alignItems="center" justifyContent="center" gap={4} ref={ref} {...props}>
        <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
      </Container>
    )
  },
)

export type ToggleGroupItemProperties = ContainerProperties & {
  defaultChecked?: boolean
  checked?: boolean
  disabled?: boolean
  onCheckedChange?(checked: boolean): void
}

export const ToggleGroupItem: (props: ToggleGroupItemProperties & RefAttributes<ContainerRef>) => ReactNode =
  forwardRef(
    (
      { children, defaultChecked, checked: providedChecked, disabled = false, onCheckedChange, hover, ...props },
      ref,
    ) => {
      const { size, variant } = useContext(ToggleGroupContext)
      const [uncontrolled, setUncontrolled] = useState(defaultChecked ?? false)
      const checked = providedChecked ?? uncontrolled
      const {
        containerHoverProps,
        containerProps,
      }: {
        containerProps?: ContainerProperties
        containerHoverProps?: ContainerProperties['hover']
      } = toggleVariants[variant]
      return (
        <Container
          onClick={
            disabled
              ? undefined
              : () => {
                  if (providedChecked == null) {
                    setUncontrolled(!checked)
                  }
                  onCheckedChange?.(!checked)
                }
          }
          alignItems="center"
          justifyContent="center"
          borderRadius={borderRadius.md}
          cursor={disabled ? undefined : 'pointer'}
          backgroundOpacity={disabled ? 0.5 : undefined}
          borderOpacity={disabled ? 0.5 : undefined}
          backgroundColor={checked ? colors.accent : undefined}
          hover={disabled ? hover : { backgroundColor: colors.muted, ...containerHoverProps, ...hover }}
          ref={ref}
          {...containerProps}
          {...toggleSizes[size]}
          {...props}
        >
          <DefaultProperties
            color={checked ? colors.accentForeground : undefined}
            opacity={disabled ? 0.5 : undefined}
            fontSize={14}
            lineHeight={20}
          >
            {children}
          </DefaultProperties>
        </Container>
      )
      //TODO: hover:text-muted-foreground
    },
  )
