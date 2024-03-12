import { Signal } from '@preact/signals-core'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { AllOptionalProperties, Properties, WithClasses, traverseProperties } from './properties/default.js'
import { createConditionalPropertyTranslator } from './utils.js'
import { Vector2Tuple } from 'three'
import { MergedProperties } from './properties/merged.js'

const breakPoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}
const breakPointKeys = Object.keys(breakPoints)
const breakPointKeysLength = breakPointKeys.length

export type WithResponsive<T> = T & {
  [Key in keyof typeof breakPoints]?: T
}

export function applyResponsiveProperties(
  merged: MergedProperties,
  defaultProperties: AllOptionalProperties | undefined,
  properties: WithClasses<WithResponsive<Properties>> & EventHandlers,
  rootSize: Signal<Vector2Tuple>,
): void {
  const translator = {
    sm: createConditionalPropertyTranslator(() => rootSize.value[0] > breakPoints.sm),
    md: createConditionalPropertyTranslator(() => rootSize.value[0] > breakPoints.md),
    lg: createConditionalPropertyTranslator(() => rootSize.value[0] > breakPoints.lg),
    xl: createConditionalPropertyTranslator(() => rootSize.value[0] > breakPoints.xl),
    '2xl': createConditionalPropertyTranslator(() => rootSize.value[0] > breakPoints['2xl']),
  }

  traverseProperties(defaultProperties, properties, (p) => {
    for (let i = 0; i < breakPointKeysLength; i++) {
      const key = breakPointKeys[i] as keyof typeof breakPoints
      const properties = p[key]
      if (properties == null) {
        continue
      }
      translator[key](merged, properties)
    }
  })
}
