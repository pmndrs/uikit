import { ReadonlySignal } from '@preact/signals-core'
import type { InheritableContainerProperties } from '../components/container.js'
import type { InheritableRootProperties } from '../components/root.js'
import type { InheritableImageProperties } from '../components/image.js'

export type AllOptionalProperties =
  | InheritableContainerProperties
  | InheritableRootProperties
  | InheritableImageProperties
//  | ContentProperties
//  | CustomContainerProperties
//  | ImageProperties
//  | SvgProperties
//  | TextProperties

export type WithReactive<T> = {
  [Key in keyof T]?: T[Key] | ReadonlySignal<T[Key] | undefined>
}

export type Properties = Record<string, unknown>

export type WithClasses<T> = T & { classes?: T | Array<T> }

export function traverseProperties<T>(
  defaultProperties: AllOptionalProperties | undefined,
  properties: WithClasses<T>,
  fn: (properties: T) => void,
): void {
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
