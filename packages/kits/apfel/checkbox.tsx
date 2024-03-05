import { Container } from '@react-three/uikit'
import { Check } from '@react-three/uikit-lucide'
import { ComponentPropsWithoutRef, useState } from 'react'
import { colors } from './theme'

type CheckboxProps = ComponentPropsWithoutRef<typeof Container> & {
  selected?: boolean
  defaultSelected?: boolean
  disabled?: boolean
  onSelectedChange?(value: boolean): void
}

export function Checkbox({ selected, disabled = false, defaultSelected, onSelectedChange, ...props }: CheckboxProps) {
  const [internalValue, setInternalValue] = useState(defaultSelected ?? false)
  const value = selected != null ? selected : internalValue

  return (
    <Container
      width={28}
      height={28}
      border={2}
      borderRadius={15}
      backgroundColor={!disabled && value ? colors.accent : colors.foreground}
      backgroundOpacity={!disabled && value ? 0.9 : 0.1}
      borderColor={!disabled && value ? colors.accent : colors.foreground}
      hover={
        disabled
          ? undefined
          : {
              backgroundOpacity: value ? 1 : 0.3,
              backgroundColor: value ? colors.accent : colors.foreground,
              borderColor: value ? colors.accent : colors.foreground,
            }
      }
      borderOpacity={disabled ? 0.2 : value ? 1 : 0.5}
      justifyContent="center"
      alignItems="center"
      cursor={disabled ? undefined : 'pointer'}
      {...props}
      onClick={(e) => {
        if (disabled) {
          return
        }
        setInternalValue(!value)
        onSelectedChange?.(!value)
        props.onClick?.(e)
      }}
    >
      {value && <Check height={18} width={18} color={colors.accentForeground} />}
    </Container>
  )
}
