import { useMemo } from 'react'
import { Signal, signal } from '@preact/signals-core'
import { WithBatchedProperties, useBatchedProperties } from './batched.js'

export type Properties = Record<string, unknown>

export type WithReactive<T> = {
  [Key in keyof T]?: T[Key] | Signal<T[Key] | undefined | null>
}

export type PropertyTransformation = (
  key: string,
  value: unknown,
  hasProperty: (key: string) => boolean,
  setProperty: (key: string, value: unknown) => void,
) => void

export type PropertyManager = {
  add(key: string, value: unknown): void
  finish(): void
}

export function applyProperties(collection: ManagerCollection, properties: Properties): void {
  const collectionLength = collection.length
  for (const key in properties) {
    for (let i = 0; i < collectionLength; i++) {
      collection[i].add(key, properties[key])
    }
  }
}

export type ManagerCollection = Array<PropertyManager>

export function createCollection(): ManagerCollection {
  return []
}

export function writeCollection(collection: ManagerCollection, key: string, value: unknown): void {
  const collectionLength = collection.length
  for (let i = 0; i < collectionLength; i++) {
    collection[i].add(key, value)
  }
}

export function finalizeCollection(collection: ManagerCollection): void {
  const collectionLength = collection.length
  for (let i = 0; i < collectionLength; i++) {
    collection[i].finish()
  }
}

export function usePropertyManager(
  collection: ManagerCollection,
  hasProperty: (key: string) => boolean,
  finishProperties: (properties: Properties, propertiesLength: number) => void,
  transformProperty?: PropertyTransformation,
): void {
  collection.push(
    useMemo(() => {
      let currentProperties: Properties = {}
      let currentPropertiesLength: number = 0
      const setProperty = (key: string, newValue: unknown): void => {
        if (newValue === undefined) {
          //only adding non undefined values to the properties
          return
        }
        const currentValue = currentProperties[key]
        if (currentValue === undefined) {
          //insert
          ++currentPropertiesLength
        }
        if (currentValue == null || !(newValue instanceof Signal)) {
          //replace or insert
          currentProperties[key] = newValue
          return
        }
        //we adding a signal to an existing property / to existing property
        if (Array.isArray(currentValue)) {
          currentValue.push(newValue)
          return
        }
        currentProperties[key] = [currentValue, newValue]
        return
      }
      const add = (key: string, value: unknown) => {
        if (value === undefined) {
          return
        }
        if (transformProperty != null) {
          transformProperty(key, value, hasProperty, setProperty)
          return
        }
        if (hasProperty(key)) {
          setProperty(key, value)
        }
      }
      return {
        add,
        finish: () => {
          finishProperties(currentProperties, currentPropertiesLength)
          currentPropertiesLength = 0
          currentProperties = {}
        },
      }
    }, [hasProperty, finishProperties, transformProperty]),
  )
}

export function equalReactiveProperty(val1: unknown, val2: unknown): boolean {
  if (!Array.isArray(val1)) {
    return val1 === val2
  }
  if (!Array.isArray(val2)) {
    return false
  }
  const length = val1.length
  if (length != val2.length) {
    return false
  }
  for (let i = 0; i < length; i++) {
    if (val1[i] != val2[i]) {
      return false
    }
  }
  return true
}

export function readReactiveProperty(value: unknown): unknown {
  if (value instanceof Signal) {
    return (value as unknown as Signal<unknown>).value
  }
  if (!Array.isArray(value)) {
    return value
  }
  let result = undefined
  const length = value.length
  for (let i = 0; i < length; i++) {
    const val = value[i]
    const current = val instanceof Signal ? val.value : val
    if (current === undefined) {
      continue
    }
    result = current
  }
  return result
}

export function useGetBatchedProperties<T extends Record<string, unknown>>(
  collection: ManagerCollection,
  keys: ReadonlyArray<keyof T>,
  propertyTransformation?: PropertyTransformation,
) {
  const getPropertySignal: WithBatchedProperties<Partial<T>>['getProperty'] = useMemo(() => signal(() => undefined), [])
  const object = useMemo<WithBatchedProperties<Partial<T>>>(
    () => ({
      hasBatchedProperty: (key) => keys.includes(key),
      getProperty: getPropertySignal,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keys],
  )
  useBatchedProperties(collection, object, propertyTransformation)
  return getPropertySignal
}
