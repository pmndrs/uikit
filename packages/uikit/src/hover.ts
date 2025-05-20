import { Signal } from '@preact/signals-core'
import { EventHandlers } from './events.js'
import { addHandler } from './components/index.js'
import { Properties } from './properties/index.js'

export type HoverEventHandlers = Pick<EventHandlers, 'onPointerOver' | 'onPointerOut'>

export function setupCursorCleanup(hoveredSignal: Signal<Array<number>>, abortSignal: AbortSignal) {
  //cleanup cursor effect
  abortSignal.addEventListener('abort', () => unsetCursorType(hoveredSignal))
}

/**
 * must be executed inside effect/computed
 */
export function addHoverHandlers(
  target: EventHandlers,
  properties: Properties,
  hoveredSignal: Signal<Array<number>>,
  hasHoverConditionalProperties: Signal<boolean>,
  defaultCursor?: string,
): void {
  const cursor = properties.value.cursor ?? defaultCursor
  const onHoverChange = properties.value.onHoverChange
  if (!hasHoverConditionalProperties.value && onHoverChange == null && cursor == null) {
    //no need to trigger a "push" by writing to .value because nobody should listen to hoveredSignal anyways
    hoveredSignal.value.length = 0
    return
  }
  addHandler('onPointerOver', target, ({ pointerId }) => {
    hoveredSignal.value = [pointerId, ...hoveredSignal.value]
    if (hoveredSignal.value.length === 1) {
      onHoverChange?.(true)
    }
    if (cursor != null) {
      setCursorType(hoveredSignal, cursor)
    }
  })
  addHandler('onPointerOut', target, ({ pointerId }) => {
    hoveredSignal.value = hoveredSignal.value.filter((id) => id != pointerId)
    if (hoveredSignal.value.length === 0) {
      onHoverChange?.(false)
    }
    unsetCursorType(hoveredSignal)
  })
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
