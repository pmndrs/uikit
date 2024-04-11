import { Signal } from '@preact/signals-core'
import { createConditionalPropertyTranslator } from './utils.js'
import { Vector2Tuple } from 'three'
import { PropertyTransformers } from './properties/merged.js'

const breakPoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}
const breakPointKeys = Object.keys(breakPoints) as Array<keyof typeof breakPoints>
const breakPointKeysLength = breakPointKeys.length

export type WithResponsive<T> = T & {
  [Key in keyof typeof breakPoints]?: T
}

export function createResponsivePropertyTransformers(rootSize: Signal<Vector2Tuple | undefined>): PropertyTransformers {
  const transformers: PropertyTransformers = {}

  for (let i = 0; i < breakPointKeysLength; i++) {
    const key = breakPointKeys[i]
    transformers[key] = createConditionalPropertyTranslator(() => (rootSize.value?.[0] ?? 0) > breakPoints[key])
  }

  return transformers
}
