import { DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef } from 'react'
import { Color } from 'three'

export const colors = {
  background: new Color().setHSL(0, 0, 100, 'srgb'),
  foreground: new Color().setHSL(222.2 / 360, 0.84, 0.049, 'srgb'),
  card: new Color().setHSL(0, 0, 1, 'srgb'),
  cardForeground: new Color().setHSL(222.2 / 360, 0.84, 0.049, 'srgb'),
  popover: new Color().setHSL(0, 0, 1, 'srgb'),
  popoverForeground: new Color().setHSL(222.2, 0.84, 0.049, 'srgb'),
  primary: new Color().setHSL(222.2 / 360, 0.474, 0.112, 'srgb'),
  primaryForeground: new Color().setHSL(210 / 360, 0.4, 0.98, 'srgb'),
  secondary: new Color().setHSL(210 / 360, 0.4, 0.961, 'srgb'),
  secondaryForeground: new Color().setHSL(222.2 / 360, 0.474, 0.112, 'srgb'),
  muted: new Color().setHSL(210 / 360, 0.4, 0.961, 'srgb'),
  mutedForeground: new Color().setHSL(215.4 / 360, 0.163, 0.469, 'srgb'),
  accent: new Color().setHSL(210 / 360, 0.4, 0.961, 'srgb'),
  accentForeground: new Color().setHSL(222.2 / 360, 0.474, 0.112, 'srgb'),
  destructive: new Color().setHSL(0, 0.7222, 0.5059, 'srgb'),
  destructiveForeground: new Color().setHSL(210 / 360, 0.4, 0.98, 'srgb'),
  border: new Color().setHSL(214.3 / 360, 0.318, 0.914, 'srgb'),
  input: new Color().setHSL(214.3 / 360, 0.318, 0.914, 'srgb'),
  ring: new Color().setHSL(222.2 / 360, 0.84, 0.049, 'srgb'),
}

export function DefaultColors(props: ComponentPropsWithoutRef<typeof DefaultProperties>) {
  return <DefaultProperties borderColor={colors.border} color={colors.foreground} {...props} />
}
