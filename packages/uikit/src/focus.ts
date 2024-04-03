import { createConditionalPropertyTranslator } from './utils.js'
import { Signal } from '@preact/signals-core'

export type WithFocus<T> = T & {
  focus?: T
  onFocusChange?: (focus: boolean) => void
}

export function createFocusPropertyTransformers(hasFocusSignal: Signal<Array<number>>) {
  return {
    hover: createConditionalPropertyTranslator(() => hasFocusSignal.value.length > 0),
  }
}
