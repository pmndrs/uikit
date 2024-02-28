import { ReadonlySignal, computed, signal } from '@preact/signals-core'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { ManagerCollection, Properties } from './properties/utils.js'
import { WithClasses, useTraverseProperties } from './properties/default.js'
import { createConditionalPropertyTranslator } from './utils.js'
import { Color as ColorRepresentation } from '@react-three/fiber'

export type WithPreferredColorScheme<T> = { dark?: T } & T

const queryList = window.matchMedia?.('(prefers-color-scheme: dark)')

const symstemIsDarkMode = signal(queryList?.matches ?? false)

queryList?.addEventListener('change', (event) => (symstemIsDarkMode.value = event.matches))

export type PreferredColorScheme = 'dark' | 'light' | 'system'

const preferredColorScheme = signal<PreferredColorScheme>('system')

const isDarkMode = computed(() => {
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

const translator = createConditionalPropertyTranslator(() => isDarkMode.value)

export function useApplyPreferredColorSchemeProperties(
  collection: ManagerCollection,
  properties: WithClasses<WithPreferredColorScheme<Properties>> & EventHandlers,
): void {
  useTraverseProperties(properties, (p) => {
    const properties = p.dark
    if (properties == null) {
      return
    }
    translator(collection, properties)
  })
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
