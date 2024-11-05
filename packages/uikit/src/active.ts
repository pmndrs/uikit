import { Signal } from '@preact/signals-core'
import { AllOptionalProperties, Properties, WithClasses, traverseProperties } from './properties/default.js'
import { createConditionalPropertyTranslator } from './utils.js'
import { EventHandlers, ThreePointerEvent } from './events.js'
import { addHandler } from './components/index.js'

export type WithActive<T> = T & {
  active?: T
  onActiveChange?: (active: boolean) => void
}

export type ActiveEventHandlers = Pick<EventHandlers, 'onPointerDown' | 'onPointerUp' | 'onPointerLeave'>

export function addActiveHandlers(
  target: EventHandlers,
  style: (WithClasses<WithActive<Properties>> & EventHandlers) | undefined,
  properties: (WithClasses<WithActive<Properties>> & EventHandlers) | undefined,
  defaultProperties: AllOptionalProperties | undefined,
  activeSignal: Signal<Array<number>>,
): void {
  let activePropertiesExist = false

  traverseProperties(style, defaultProperties, properties, (p) => {
    if ('active' in p) {
      activePropertiesExist = true
    }
  })

  if (!activePropertiesExist && style?.onActiveChange == null && properties?.onActiveChange == null) {
    //no need to listen to hover
    activeSignal.value.length = 0
    return
  }
  const onLeave = ({ pointerId }: ThreePointerEvent) => {
    activeSignal.value = activeSignal.value.filter((id) => id != pointerId)
    if (activeSignal.value.length > 0) {
      return
    }
    properties?.onActiveChange?.(false)
    style?.onActiveChange?.(false)
  }
  addHandler('onPointerDown', target, ({ pointerId }) => {
    activeSignal.value = [pointerId, ...activeSignal.value]
    if (activeSignal.value.length != 1) {
      return
    }
    properties?.onActiveChange?.(true)
    style?.onActiveChange?.(true)
  })
  addHandler('onPointerUp', target, onLeave)
  addHandler('onPointerLeave', target, onLeave)
}
export function createActivePropertyTransfomers(activeSignal: Signal<Array<number>>) {
  return {
    active: createConditionalPropertyTranslator(() => activeSignal.value.length > 0),
  }
}
