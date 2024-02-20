import { useMemo } from 'react'
import {
  PropertyTransformation,
  equalReactiveProperty,
  readReactiveProperty,
  usePropertyManager,
  Properties,
  ManagerCollection,
} from './utils.js'
import { Signal } from '@preact/signals-core'

export type WithBatchedProperties<P extends Record<string, unknown> = {}> = {
  hasBatchedProperty(key: keyof P): boolean
  getProperty: Signal<<K extends keyof P>(key: K) => P[K]>
}

export function useBatchedProperties(
  collection: ManagerCollection,
  object: WithBatchedProperties,
  transformProperty?: PropertyTransformation,
): void {
  const hasProperty = useMemo(() => object.hasBatchedProperty.bind(object), [object])
  const finishProperties = useMemo(() => {
    let prevProperties: Properties = {}
    return (properties: Properties, propertiesLength: number) => {
      let prevPropertiesLength = 0
      let changed = false
      for (const key in prevProperties) {
        if (!equalReactiveProperty(prevProperties[key], properties[key])) {
          changed = true
          break
        }
        ++prevPropertiesLength
      }
      changed ||= prevPropertiesLength != propertiesLength
      prevProperties = properties
      if (!changed) {
        return
      }
      object.getProperty.value = (key) => readReactiveProperty(properties[key]) as never
    }
  }, [object])
  usePropertyManager(collection, hasProperty as (key: string) => boolean, finishProperties, transformProperty)
}
