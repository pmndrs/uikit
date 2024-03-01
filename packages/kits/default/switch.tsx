import { Container } from '@react-three/uikit'
import { ComponentPropsWithoutRef, useState } from 'react'
import { colors } from './theme'

export function Switch({
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
      height={24}
      width={44}
      flexShrink={0}
      flexDirection="row"
      padding={2}
      alignItems="center"
      backgroundOpacity={disabled ? 0.5 : undefined}
      borderRadius={1000}
      backgroundColor={checked ? colors.primary : colors.input}
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
      {...props}
    >
      <Container
        width={20}
        height={20}
        borderRadius={1000}
        transformTranslateX={checked ? 20 : 0}
        backgroundColor={colors.background}
      />
    </Container>
  )
}
