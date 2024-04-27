import { ReadonlySignal, computed, signal } from '@preact/signals-core'
import { isDarkMode, setPreferredColorScheme, DefaultProperties, DefaultPropertiesProperties } from '@react-three/uikit'
import { Theme, themes } from './themes.js'
import { Color } from 'three'
import { useEditorStore } from './state.js'

setPreferredColorScheme(useEditorStore.getState().lightMode ? 'light' : 'dark')
useEditorStore.subscribe((state) => setPreferredColorScheme(state.lightMode ? 'light' : 'dark'))

const baseBorderRadius = signal(useEditorStore.getState().borderRadius)
useEditorStore.subscribe((state) => (baseBorderRadius.value = state.borderRadius * 16))

export const borderRadius = {
  lg: baseBorderRadius,
  md: computed(() => baseBorderRadius.value - 2),
  sm: computed(() => baseBorderRadius.value - 4),
}

const theme = signal<Theme>(useEditorStore.getState().theme)
useEditorStore.subscribe((state) => (theme.value = state.theme))

export const colors = {} as {
  -readonly [Key in keyof (typeof themes)['slate']['light']]: ReadonlySignal<Color>
}
for (const anyKey in themes['slate']['light']) {
  const key = anyKey as keyof (typeof themes)['slate']['light']
  colors[key] = computed<Color>(() => themes[theme.value][isDarkMode.value ? 'dark' : 'light'][key])
}

export function Defaults(props: DefaultPropertiesProperties) {
  return (
    <DefaultProperties
      scrollbarColor={colors.foreground}
      scrollbarBorderRadius={4}
      scrollbarOpacity={0.3}
      borderColor={colors.border}
      color={colors.foreground}
      {...props}
    />
  )
}
