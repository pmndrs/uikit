import { Signal } from '@preact/signals-core'
import { Properties } from './properties/index.js'
import { EventHandlers, ThreePointerEvent } from './events.js'
import { addHandler } from './utils.js'

/**
 * must be executed inside effect/computed
 */
export function addActiveHandlers(
  target: EventHandlers,
  properties: Properties,
  activeSignal: Signal<Array<number>>,
  hasActiveConditionalProperties: Signal<boolean>,
): void {
  if (!hasActiveConditionalProperties.value && properties.value.onActiveChange == null) {
    return
  }

  const onLeave = ({ pointerId }: ThreePointerEvent) => {
    activeSignal.value = activeSignal.value.filter((id) => id != pointerId)
    if (activeSignal.value.length > 0) {
      return
    }
    properties.peek().onActiveChange?.(false)
  }
  addHandler('onPointerDown', target, ({ pointerId }) => {
    activeSignal.value = [pointerId, ...activeSignal.value]
    if (activeSignal.value.length != 1) {
      return
    }
    properties.peek().onActiveChange?.(true)
  })
  addHandler('onPointerUp', target, onLeave)
  addHandler('onPointerLeave', target, onLeave)
}
