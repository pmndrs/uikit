import { Signal, computed } from '@preact/signals-core'
import { MergedProperties } from './merged.js'

export type GetBatchedProperties = (key: string) => unknown

export function createGetBatchedProperties(
  propertiesSignal: Signal<MergedProperties>,
  keys: Array<string>,
  renameOutput?: Record<string, string>,
): GetBatchedProperties {
  const reverseRenameMap: Record<string, string> = {}
  for (const key in renameOutput) {
    reverseRenameMap[renameOutput[key]] = key
  }
  let currentProperties: MergedProperties | undefined
  const hasPropertiy = (key: string) => keys.includes(key)
  const computedProperties = computed(() => {
    const newProperties = propertiesSignal.value
    if (!newProperties.filterIsEqual(hasPropertiy, currentProperties)) {
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
