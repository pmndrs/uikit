import { Signal, computed } from '@preact/signals-core'
import { MergedProperties } from './merged.js'

export function computedProperty<T>(
  propertiesSignal: Signal<MergedProperties>,
  key: string,
  defaultValue: T,
): Signal<T> {
  return computed(() => propertiesSignal.value.read(key, defaultValue))
}
