import { Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef, createContext, useContext, useState } from 'react'
import { colors } from './theme.js'

const toggleVariants: {
  [Key in string]: {
    containerProps?: ComponentPropsWithoutRef<typeof Container>
    containerHoverProps?: ComponentPropsWithoutRef<typeof Container>['hover']
  }
} = {
  default: {},
  outline: {
    containerProps: {
      border: 1,
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
} satisfies { [Key in string]: ComponentPropsWithoutRef<typeof Container> }

const ToggleGroupContext = createContext<{
  size: keyof typeof toggleSizes
  variant: keyof typeof toggleVariants
}>(null as any)

export function ToggleGroup({
  children,
  size = 'default',
  variant = 'default',
  ...props
}: ComponentPropsWithoutRef<typeof Container> & {
  variant?: keyof typeof toggleVariants
  size?: keyof typeof toggleSizes
}) {
  return (
    <Container flexDirection="row" alignItems="center" justifyContent="center" gap={4} {...props}>
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </Container>
  )
}

export function ToggleGroupItem({
  children,
  defaultChecked,
  checked: providedChecked,
  disabled = false,
  onCheckedChange,
  hover,
  ...props
}: ComponentPropsWithoutRef<typeof Container> & {
  defaultChecked?: boolean
  checked?: boolean
  disabled?: boolean
  onCheckedChange?(checked: boolean): void
}) {
  const { size, variant } = useContext(ToggleGroupContext)
  const [uncontrolled, setUncontrolled] = useState(defaultChecked ?? false)
  const checked = providedChecked ?? uncontrolled
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
      borderRadius={6}
      cursor={disabled ? undefined : 'pointer'}
      backgroundOpacity={disabled ? 0.5 : undefined}
      borderOpacity={disabled ? 0.5 : undefined}
      backgroundColor={checked ? colors.accent : undefined}
      hover={
        disabled ? hover : { backgroundColor: colors.muted, ...toggleVariants[variant].containerHoverProps, ...hover }
      }
      {...toggleVariants[variant].containerProps}
      {...toggleSizes[size]}
      {...props}
    >
      <DefaultProperties
        color={checked ? colors.accentForeground : undefined}
        opacity={disabled ? 0.5 : undefined}
        fontSize={14}
        lineHeight={1.43}
      >
        {children}
      </DefaultProperties>
    </Container>
  )
  //TODO: hover:text-muted-foreground
}
