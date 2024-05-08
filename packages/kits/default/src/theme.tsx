import { ReadonlySignal, computed, signal } from '@preact/signals-core'
import { isDarkMode, DefaultProperties, DefaultPropertiesProperties } from '@react-three/uikit'
import { Theme, themes } from './themes.js'
import { Color } from 'three'
import React from 'react'

export const baseBorderRadius = signal(8)

export const borderRadius = {
  lg: baseBorderRadius,
  md: computed(() => baseBorderRadius.value - 2),
  sm: computed(() => baseBorderRadius.value - 4),
}

export const themeName = signal<Theme>('slate')

export const colors = {} as {
  -readonly [Key in keyof (typeof themes)['slate']['light']]: ReadonlySignal<Color>
}
for (const anyKey in themes['slate']['light']) {
  const key = anyKey as keyof (typeof themes)['slate']['light']
  colors[key] = computed<Color>(() => themes[themeName.value][isDarkMode.value ? 'dark' : 'light'][key])
}

export function Defaults(props: DefaultPropertiesProperties) {
  return (
    <DefaultProperties
      scrollbarColor={colors.foreground}
      scrollbarBorderRadius={4}
      scrollbarOpacity={0.3}
      lineHeight="150%"
      borderColor={colors.border}
      color={colors.foreground}
      {...props}
    />
  )
}
