import { signal } from '@preact/signals-core'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { setCursorType, unsetCursorType } from './cursor.js'
import { Properties } from './properties/utils.js'
import { AllOptionalProperties, WithClasses, traverseProperties } from './properties/default.js'
import { Subscriptions, createConditionalPropertyTranslator } from './utils.js'
import { MergedProperties } from './properties/merged.js'

export type WithHover<T> = T & {
  cursor?: string
  hover?: T
  onHoverChange?: (hover: boolean) => void
}

export type HoverEventHandlers = Pick<EventHandlers, 'onPointerOver' | 'onPointerOut'>

export function applyHoverProperties(
  merged: MergedProperties,
  defaultProperties: AllOptionalProperties | undefined,
  properties: WithClasses<WithHover<Properties>> & EventHandlers,
  subscriptions: Subscriptions,
): HoverEventHandlers | undefined {
  const hoveredSignal = signal<Array<number>>([])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const translate = createConditionalPropertyTranslator(() => hoveredSignal.value.length > 0)
  let hoverPropertiesExist = false

  traverseProperties(defaultProperties, properties, (p) => {
    if (p.hover == null) {
      return
    }
    hoverPropertiesExist = true
    translate(merged, p.hover)
  })

  //cleanup cursor effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  subscriptions.push(() => unsetCursorType(hoveredSignal))

  if (!hoverPropertiesExist && properties.onHoverChange == null && properties.cursor == null) {
    //no need to listen to hover
    hoveredSignal.value.length = 0
    return undefined
  }
  return {
    onPointerOver: (e) => {
      hoveredSignal.value = [e.pointerId, ...hoveredSignal.value]
      if (properties.onHoverChange != null && hoveredSignal.value.length === 1) {
        properties.onHoverChange(true)
      }
      if (properties.cursor != null) {
        setCursorType(hoveredSignal, properties.cursor)
      }
    },
    onPointerOut: (e) => {
      hoveredSignal.value = hoveredSignal.value.filter((id) => id != e.pointerId)
      if (properties.onHoverChange != null && hoveredSignal.value.length === 0) {
        properties.onHoverChange(false)
      }
      unsetCursorType(hoveredSignal)
    },
  }
}
