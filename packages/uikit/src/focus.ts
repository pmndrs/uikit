import { createConditionalPropertyTranslator } from './utils.js'
import { Signal } from '@preact/signals-core'

export type WithFocus<T> = T & {
  focus?: T
  onFocusChange?: (focus: boolean) => void
}

export function createFocusPropertyTransformers(hasFocusSignal: Signal<boolean>) {
  return {
    focus: createConditionalPropertyTranslator(() => hasFocusSignal.value),
  }
}
