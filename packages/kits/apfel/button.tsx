import { Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef } from 'react'
import { colors } from './theme'

const sizes = {
  xs: {
    iconSize: 12,
    height: 24,
    padding: 6,
    borderRadius: 4,
    fontSize: 8,
  },
  sm: {
    height: 32,
    padding: 12,
    borderRadius: 8,
    fontSize: 12,
    iconSize: 14,
  },
  md: {
    height: 44,
    padding: 20,
    borderRadius: 12,
    fontSize: 14,
    iconSize: 18,
  },
  lg: {
    height: 52,
    padding: 25,
    borderRadius: 16,
    fontSize: 16,
    iconSize: 22,
  },
  xl: {
    height: 56,
    padding: 29,
    borderRadius: 20,
    fontSize: 18,
    iconSize: 28,
  },
}

type Variant = 'pill' | 'rect' | 'icon'
type Size = keyof typeof sizes

export function Button({
  children,
  size = 'md',
  variant = 'rect',
  platter,
  selected,
  disabled,
  ...props
}: ComponentPropsWithoutRef<typeof Container> & {
  size?: Size
  variant?: Variant
  platter?: boolean
  selected?: boolean
  disabled?: boolean
}) {
  const { borderRadius, fontSize, height, padding, iconSize } = sizes[size]
  return (
    <Container
      cursor={disabled ? undefined : 'pointer'}
      height={height}
      width={variant === 'icon' ? height : undefined}
      paddingX={padding}
      borderRadius={variant === 'rect' ? borderRadius : height / 2}
      justifyContent="center"
      alignItems="center"
      backgroundColor={colors.foreground}
      backgroundOpacity={disabled ? 0.1 : selected ? 1 : platter ? 0.15 : 0}
      hover={{
        backgroundOpacity: disabled ? 0.1 : selected ? 1 : 0.2,
      }}
      {...props}
    >
      <DefaultProperties
        color={selected && !disabled ? colors.background : colors.foreground}
        opacity={disabled ? 0.4 : 1}
        fontSize={fontSize}
        width={variant === 'icon' ? iconSize : undefined}
        height={variant === 'icon' ? iconSize : undefined}
      >
        {children}
      </DefaultProperties>
    </Container>
  )
}
