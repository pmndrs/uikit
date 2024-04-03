import { Signal } from '@preact/signals-core'
import { AllOptionalProperties, Properties, WithClasses, traverseProperties } from './properties/default.js'
import { createConditionalPropertyTranslator } from './utils.js'
import { addHandler } from './panel/instanced-panel-mesh.js'
import { EventHandlers, ThreeEvent } from './events.js'

export type WithActive<T> = T & {
  active?: T
  onActiveChange?: (active: boolean) => void
}

export type ActiveEventHandlers = Pick<EventHandlers, 'onPointerDown' | 'onPointerUp' | 'onPointerLeave'>

export function addActiveHandlers(
  target: EventHandlers,
  properties: WithClasses<WithActive<Properties>> & EventHandlers,
  defaultProperties: AllOptionalProperties | undefined,
  activeSignal: Signal<Array<number>>,
): void {
  let activePropertiesExist = false

  traverseProperties(defaultProperties, properties, (p) => {
    if ('active' in p) {
      activePropertiesExist = true
    }
  })

  if (!activePropertiesExist && properties.onActiveChange == null) {
    //no need to listen to hover
    activeSignal.value.length = 0
    return
  }
  const onLeave = ({ nativeEvent }: ThreeEvent<PointerEvent>) => {
    activeSignal.value = activeSignal.value.filter((id) => id != nativeEvent.pointerId)
    if (properties.onActiveChange == null || activeSignal.value.length > 0) {
      return
    }
    properties.onActiveChange(false)
  }
  addHandler('onPointerDown', target, ({ nativeEvent }) => {
    activeSignal.value = [nativeEvent.pointerId, ...activeSignal.value]
    if (properties.onActiveChange == null || activeSignal.value.length != 1) {
      return
    }
    properties.onActiveChange(true)
  })
  addHandler('onPointerUp', target, onLeave)
  addHandler('onPointerLeave', target, onLeave)
}
export function createActivePropertyTransfomers(activeSignal: Signal<Array<number>>) {
  return {
    active: createConditionalPropertyTranslator(() => activeSignal.value.length > 0),
  }
}
