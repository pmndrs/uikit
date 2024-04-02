import { createConditionalPropertyTranslator } from './utils.js'
import { Signal } from '@preact/signals-core'
import { PropertyTransformers } from './internals.js'

export type WithFocus<T> = T & {
  focus?: T
  onFocusChange?: (focus: boolean) => void
}

export function createFocusPropertyTransformers(hasFocusSignal: Signal<Array<number>>): PropertyTransformers {
  return {
    hover: createConditionalPropertyTranslator(() => hasFocusSignal.value.length > 0),
  }
}
