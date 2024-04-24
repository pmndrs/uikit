import { ReadonlySignal } from '@preact/signals-core'
import type {
  InheritableContainerProperties,
  InheritableRootProperties,
  InheritableImageProperties,
  InheritableContentProperties,
  InheritableCustomContainerProperties,
  InheritableTextProperties,
  InheritableIconProperties,
  InheritableInputProperties,
  InheritableSvgProperties,
} from '../components/index.js'

export type AllOptionalProperties =
  | InheritableContainerProperties
  | InheritableRootProperties
  | InheritableImageProperties
  | InheritableContentProperties
  | InheritableCustomContainerProperties
  | InheritableImageProperties
  | InheritableSvgProperties
  | InheritableTextProperties
  | InheritableIconProperties
  | InheritableInputProperties

export type WithReactive<T> = {
  [Key in keyof T]?: T[Key] | ReadonlySignal<T[Key] | undefined>
}

export type Properties = Record<string, unknown>

export type WithClasses<T> = T & { classes?: T | Array<T> }

export function traverseProperties<T>(
  style: WithClasses<T> | undefined,
  properties: WithClasses<T> | undefined,
  defaultProperties: AllOptionalProperties | undefined,
  fn: (properties: T) => void,
): void {
  if (defaultProperties != null) {
    traverseClasses(defaultProperties.classes as any, fn)
    fn(defaultProperties as T)
  }
  if (properties != null) {
    traverseClasses(properties.classes as any, fn)
    fn(properties)
  }
  if (style != null) {
    traverseClasses(style.classes as any, fn)
    fn(style)
  }
}

function traverseClasses<T>(classes: WithClasses<T>['classes'], fn: (properties: T) => void) {
  if (classes == null) {
    return
  }
  if (!Array.isArray(classes)) {
    fn(classes as T)
    return
  }
  const classesLength = classes.length
  for (let i = 0; i < classesLength; i++) {
    fn(classes[i])
  }
  return
}
