import { Signal } from '@preact/signals-core'
import { Properties } from './properties/index.js'
import { EventHandlersProperties, ThreePointerEvent } from './events.js'
import { addHandler } from './utils.js'

/**
 * must be executed inside effect/computed
 */
export function addActiveHandlers(
  target: EventHandlersProperties,
  properties: Properties,
  activeSignal: Signal<Array<number>>,
  hasActiveConditionalInProperties: Signal<boolean>,
  hasActiveConditionalInStarProperties: Signal<boolean>,
): void {
  if (
    !hasActiveConditionalInStarProperties.value &&
    !hasActiveConditionalInProperties.value &&
    properties.value.onActiveChange == null
  ) {
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
    if (pointerId == null) {
      return
    }
    activeSignal.value = [pointerId, ...activeSignal.value]
    if (activeSignal.value.length != 1) {
      return
    }
    properties.peek().onActiveChange?.(true)
  })
  addHandler('onPointerUp', target, onLeave)
  addHandler('onPointerLeave', target, onLeave)
}
