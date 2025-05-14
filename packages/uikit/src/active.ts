import { Signal } from '@preact/signals-core'
import { Properties } from './properties/index.js'
import { EventHandlers, ThreePointerEvent } from './events.js'
import { addHandler } from './components/index.js'

export type ActiveEventHandlers = Pick<EventHandlers, 'onPointerDown' | 'onPointerUp' | 'onPointerLeave'>

/**
 * must be executed inside effect/computed
 */
export function addActiveHandlers(
  target: EventHandlers,
  properties: Properties,
  activeSignal: Signal<Array<number>>,
  hasActiveConditionalProperties: Signal<boolean>,
): void {
  if (!hasActiveConditionalProperties.value && properties.get('onActiveChange') == null) {
    return
  }

  const onLeave = ({ pointerId }: ThreePointerEvent) => {
    activeSignal.value = activeSignal.value.filter((id) => id != pointerId)
    if (activeSignal.value.length > 0) {
      return
    }
    properties.peek('onActiveChange')?.(false)
  }
  addHandler('onPointerDown', target, ({ pointerId }) => {
    activeSignal.value = [pointerId, ...activeSignal.value]
    if (activeSignal.value.length != 1) {
      return
    }
    properties.peek('onActiveChange')?.(true)
  })
  addHandler('onPointerUp', target, onLeave)
  addHandler('onPointerLeave', target, onLeave)
}
