import { Signal, computed } from '@preact/signals-core'
import { MergedProperties } from './merged.js'
import { readReactive } from '../utils.js'

export function computedInheritableProperty<T>(
  propertiesSignal: Signal<MergedProperties>,
  key: string,
  defaultValue: T,
): Signal<T> {
  return computed(() => propertiesSignal.value.read(key, defaultValue))
}

export function computedNonInheritableProperty<T>(
  style: Signal<Record<string, unknown> | undefined>,
  properties: Signal<Record<string, unknown> | undefined>,
  key: string,
  defaultValue: T,
): Signal<T> {
  return computed(
    () => readReactive(style.value?.[key] as T) ?? readReactive(properties.value?.[key] as T) ?? defaultValue,
  )
}
