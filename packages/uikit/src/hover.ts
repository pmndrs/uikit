import { Signal } from '@preact/signals-core'
import { AllOptionalProperties, traverseProperties } from './properties/default.js'
import { Subscriptions, createConditionalPropertyTranslator } from './utils.js'
import { PropertyTransformers } from './properties/merged.js'
import { addHandler } from './panel/instanced-panel-mesh.js'
import { EventHandlers } from './events.js'

export type WithHover<T> = T & {
  cursor?: string
  hover?: T
  onHoverChange?: (hover: boolean) => void
}
export type HoverEventHandlers = Pick<EventHandlers, 'onPointerOver' | 'onPointerOut'>

export function setupCursorCleanup(hoveredSignal: Signal<Array<number>>, subscriptions: Subscriptions) {
  //cleanup cursor effect
  subscriptions.push(() => unsetCursorType(hoveredSignal))
}

export function addHoverHandlers(
  target: EventHandlers,
  properties: WithHover<{}>,
  defaultProperties: AllOptionalProperties | undefined,
  hoveredSignal: Signal<Array<number>>,
): void {
  let hoverPropertiesExist = false
  traverseProperties(defaultProperties, properties, (p) => {
    if ('hover' in p) {
      hoverPropertiesExist = true
    }
  })

  if (!hoverPropertiesExist && properties.onHoverChange == null && properties.cursor == null) {
    //no need to listen to hover
    hoveredSignal.value.length = 0
    return
  }
  addHandler('onPointerOver', target, ({ nativeEvent }) => {
    hoveredSignal.value = [nativeEvent.pointerId, ...hoveredSignal.value]
    if (properties.onHoverChange != null && hoveredSignal.value.length === 1) {
      properties.onHoverChange(true)
    }
    if (properties.cursor != null) {
      setCursorType(hoveredSignal, properties.cursor)
    }
  })
  addHandler('onPointerOut', target, ({ nativeEvent }) => {
    hoveredSignal.value = hoveredSignal.value.filter((id) => id != nativeEvent.pointerId)
    if (properties.onHoverChange != null && hoveredSignal.value.length === 0) {
      properties.onHoverChange(false)
    }
    unsetCursorType(hoveredSignal)
  })
}

export function createHoverPropertyTransformers(hoveredSignal: Signal<Array<number>>): PropertyTransformers {
  return {
    hover: createConditionalPropertyTranslator(() => hoveredSignal.value.length > 0),
  }
}

const cursorRefStack: Array<unknown> = []
const cursorTypeStack: Array<string> = []

export function setCursorType(ref: unknown, type: string): void {
  cursorRefStack.push(ref)
  cursorTypeStack.push(type)
  document.body.style.cursor = type
}

export function unsetCursorType(ref: unknown): void {
  const index = cursorRefStack.indexOf(ref)
  if (index == -1) {
    return
  }
  cursorRefStack.splice(index, 1)
  cursorTypeStack.splice(index, 1)
  document.body.style.cursor = cursorTypeStack[cursorTypeStack.length - 1] ?? 'default'
}
