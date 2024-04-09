import { Container } from '@react-three/uikit'
import { Check } from '@react-three/uikit-lucide'
import React, { ComponentPropsWithoutRef, useState } from 'react'
import { colors } from './theme'

export function Checkbox({
  defaultChecked,
  checked: providedChecked,
  disabled = false,
  onCheckedChange,
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Container>, 'children'> & {
  defaultChecked?: boolean
  checked?: boolean
  disabled?: boolean
  onCheckedChange?(checked: boolean): void
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked ?? false)
  const checked = providedChecked ?? uncontrolled
  return (
    <Container
      alignItems="center"
      justifyContent="center"
      cursor={disabled ? undefined : 'pointer'}
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
      borderRadius={4}
      width={16}
      height={16}
      border={1}
      borderColor={colors.primary}
      backgroundColor={checked ? colors.primary : undefined}
      backgroundOpacity={disabled ? 0.5 : undefined}
      borderOpacity={disabled ? 0.5 : undefined}
      {...props}
    >
      <Check
        color={checked ? colors.primaryForeground : undefined}
        opacity={checked ? (disabled ? 0.5 : undefined) : 0}
        width={14}
        height={14}
      />
    </Container>
  )
}
