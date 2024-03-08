import { signal } from '@preact/signals-core'
import type { EventHandlers, ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { Properties } from './properties/utils.js'
import { AllOptionalProperties, WithClasses, traverseProperties } from './properties/default.js'
import { createConditionalPropertyTranslator } from './utils.js'
import { MergedProperties } from './properties/merged.js'

export type WithActive<T> = T & {
  active?: T
  onActiveChange?: (active: boolean) => void
}

export type ActiveEventHandlers = Pick<EventHandlers, 'onPointerDown' | 'onPointerUp' | 'onPointerLeave'>

export function applyActiveProperties(
  merged: MergedProperties,
  defaultProperties: AllOptionalProperties | undefined,
  properties: WithClasses<WithActive<Properties>> & EventHandlers,
): ActiveEventHandlers | undefined {
  const activeSignal = signal<Array<number>>([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const translate = createConditionalPropertyTranslator(() => activeSignal.value.length > 0)
  let activePropertiesExist = false

  traverseProperties(defaultProperties, properties, (p) => {
    if (p.active == null) {
      return
    }
    activePropertiesExist = true
    translate(merged, p.active)
  })

  if (!activePropertiesExist && properties.onActiveChange == null) {
    //no need to listen to hover
    activeSignal.value.length = 0
    return undefined
  }
  const onLeave = (e: ThreeEvent<PointerEvent>) => {
    activeSignal.value = activeSignal.value.filter((id) => id != e.pointerId)
    if (properties.onActiveChange == null || activeSignal.value.length > 0) {
      return
    }
    properties.onActiveChange(false)
  }
  return {
    onPointerDown: (e) => {
      activeSignal.value = [e.pointerId, ...activeSignal.value]
      if (properties.onActiveChange == null || activeSignal.value.length != 1) {
        return
      }
      properties.onActiveChange(true)
    },
    onPointerUp: onLeave,
    onPointerLeave: onLeave,
  }
}
