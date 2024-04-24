import { ReadonlySignal, computed, signal } from '@preact/signals-core'
import { ColorRepresentation, createConditionalPropertyTranslator } from './utils.js'
import { PropertyTransformers } from './properties/merged.js'

export type WithPreferredColorScheme<T> = { dark?: T } & T

const queryList = typeof matchMedia === 'undefined' ? undefined : matchMedia?.('(prefers-color-scheme: dark)')

const symstemIsDarkMode = signal(queryList?.matches ?? false)

queryList?.addEventListener('change', (event) => (symstemIsDarkMode.value = event.matches))

export type PreferredColorScheme = 'dark' | 'light' | 'system'

const preferredColorScheme = signal<PreferredColorScheme>('system')

export const isDarkMode = computed(() => {
  switch (preferredColorScheme.value) {
    case 'system':
      return symstemIsDarkMode.value
    case 'dark':
      return true
    case 'light':
      return false
  }
})

export function setPreferredColorScheme(scheme: PreferredColorScheme) {
  preferredColorScheme.value = scheme
}

export function getPreferredColorScheme() {
  return preferredColorScheme.peek()
}

export const darkPropertyTransformers: PropertyTransformers = {
  dark: createConditionalPropertyTranslator(() => isDarkMode.value),
}

export function basedOnPreferredColorScheme<const T extends { [Key in string]: ColorRepresentation }>({
  dark,
  light,
}: {
  dark: T
  light: T
}) {
  const result = {} as { [Key in keyof T]: ReadonlySignal<ColorRepresentation> }
  for (const key in dark) {
    result[key] = computed(() => (isDarkMode.value ? dark[key] : light[key]))
  }
  return result
}
