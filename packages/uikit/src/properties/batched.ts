import { Signal, computed } from '@preact/signals-core'
import { MergedProperties } from './merged.js'

export type GetBatchedProperties = (key: string) => unknown

export function createGetBatchedProperties(
  propertiesSignal: Signal<MergedProperties>,
  hasProperty: (key: string) => boolean,
  renameOutput?: Record<string, string>,
): GetBatchedProperties {
  const reverseRenameMap: Record<string, string> = {}
  for (const key in renameOutput) {
    reverseRenameMap[renameOutput[key]] = key
  }
  let currentProperties: MergedProperties | undefined
  const computedProperties = computed(() => {
    const newProperties = propertiesSignal.value
    if (!newProperties.filterIsEqual(hasProperty, currentProperties)) {
      //update current properties
      currentProperties = newProperties
    }
    //due to the referencial equality check, the computed value only updates when filterIsEqual returns false
    return currentProperties
  })
  return (key) => {
    if (key in reverseRenameMap) {
      key = reverseRenameMap[key]
    }
    return computedProperties.value?.read(key)
  }
}
