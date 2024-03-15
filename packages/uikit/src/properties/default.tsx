import { createContext, ReactNode, useContext } from 'react'
import { applyProperties, ManagerCollection, PropertyManager } from './utils.js'
import { ContainerProperties } from '../components/container.js'
import { ContentProperties } from '../components/content.js'
import { ImageProperties } from '../components/image.js'
import { RootProperties } from '../components/root.js'
import { SvgProperties } from '../components/svg.js'
import { CustomContainerProperties } from '../components/custom.js'
import { InputProperties, TextProperties } from '../index.js'

export type AllOptionalProperties =
  | ContainerProperties
  | ContentProperties
  | CustomContainerProperties
  | ImageProperties
  | RootProperties
  | SvgProperties
  | TextProperties
  | InputProperties

const DefaultPropertiesContext = createContext<AllOptionalProperties | undefined>(undefined)

export type WithClasses<T> = T & { classes?: T | Array<T> }

export function useTraverseProperties<T>(properties: WithClasses<T>, fn: (properties: T) => void): void {
  const defaultProperties = useContext(DefaultPropertiesContext)
  if (defaultProperties != null) {
    fn(defaultProperties as T)
  }
  const { classes } = properties
  if (Array.isArray(classes)) {
    const classesLength = classes.length
    for (let i = 0; i < classesLength; i++) {
      fn(classes[i])
    }
  } else if (classes != null) {
    fn(classes)
  }
  fn(properties)
}

export function useApplyProperties(
  collection: ManagerCollection,
  properties: WithClasses<Record<string, unknown>>,
): void {
  useTraverseProperties(properties, (p) => applyProperties(collection, p))
}

export function DefaultProperties(properties: { children?: ReactNode } & AllOptionalProperties) {
  const existingDefaultProperties = useContext(DefaultPropertiesContext)
  const result: any = { ...existingDefaultProperties }
  for (const key in properties) {
    if (key === 'children') {
      continue
    }
    const value = properties[key as keyof AllOptionalProperties]
    if (value == null) {
      continue
    }
    result[key] = value as any
  }
  return <DefaultPropertiesContext.Provider value={result}>{properties.children}</DefaultPropertiesContext.Provider>
}
