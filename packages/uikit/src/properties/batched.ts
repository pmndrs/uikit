import { Signal, computed } from '@preact/signals-core'
import { MergedProperties } from './merged.js'

export type GetBatchedProperties<T> = <K extends keyof T>(key: K) => T[K]

export function createGetBatchedProperties<T>(
  propertiesSignal: Signal<MergedProperties>,
  keys: ReadonlyArray<keyof T>,
): GetBatchedProperties<T> {
  let currentProperties: MergedProperties | undefined
  const hasPropertiy = (key: string) => keys.includes(key as any)
  const computedProperties = computed(() => {
    const newProperties = propertiesSignal.value
    if (!newProperties.filterIsEqual(hasPropertiy, currentProperties)) {
      //update current properties
      currentProperties = newProperties
    }
    //due to the referencial equality check, the computed value only updates when filterIsEqual returns false
    return currentProperties
  })
  return (key) => computedProperties.value?.read(key as any) as any
}
