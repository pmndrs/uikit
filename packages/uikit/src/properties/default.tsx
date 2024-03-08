import { ReadonlySignal } from '@preact/signals-core'
import { ContainerProperties } from '../components/container.js'
import { ContentProperties } from '../react/content.js'
import { CustomContainerProperties } from '../react/custom.js'
import { ImageProperties } from '../react/image.js'
import { RootProperties } from '../react/root.js'
import { SvgProperties } from '../react/svg.js'
import { TextProperties } from '../react/text.js'

export type AllOptionalProperties =
  | ContainerProperties
  | ContentProperties
  | CustomContainerProperties
  | ImageProperties
  | RootProperties
  | SvgProperties
  | TextProperties

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
