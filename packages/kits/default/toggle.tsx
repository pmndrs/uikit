import { Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef, useState } from 'react'
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

export function Toggle({
  children,
  size = 'default',
  variant = 'default',
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
  variant?: keyof typeof toggleVariants
  size?: keyof typeof toggleSizes
}) {
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
        fontWeight="medium"
      >
        {children}
      </DefaultProperties>
    </Container>
  )
  //TODO: hover:text-muted-foreground
}
