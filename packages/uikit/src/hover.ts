import { Signal } from '@preact/signals-core'
import { EventHandlersProperties } from './events.js'
import { Properties } from './properties/index.js'
import { addHandler } from './utils.js'

export function setupCursorCleanup(hoveredSignal: Signal<Array<number>>, abortSignal: AbortSignal) {
  //cleanup cursor effect
  abortSignal.addEventListener('abort', () => unsetCursorType(hoveredSignal))
}

/**
 * must be executed inside effect/computed
 */
export function addHoverHandlers(
  target: EventHandlersProperties,
  properties: Properties,
  hoveredSignal: Signal<Array<number>>,
  hasHoverConditionalInProperties: Signal<boolean>,
  hasHoverConditionalInStarProperties: Signal<boolean>,
): void {
  const cursor = properties.value.cursor
  const onHoverChange = properties.value.onHoverChange
  if (
    !hasHoverConditionalInStarProperties.value &&
    !hasHoverConditionalInProperties.value &&
    onHoverChange == null &&
    cursor == null
  ) {
    //no need to trigger a "push" by writing to .value because nobody should listen to hoveredSignal anyways
    hoveredSignal.value.length = 0
    return
  }
  addHandler('onPointerEnter', target, ({ pointerId }) => {
    if (pointerId == null) {
      return
    }
    hoveredSignal.value = [pointerId, ...hoveredSignal.value]
    if (hoveredSignal.value.length === 1) {
      onHoverChange?.(true)
    }
    if (cursor != null) {
      setCursorType(hoveredSignal, cursor)
    }
  })
  addHandler('onPointerLeave', target, ({ pointerId }) => {
    hoveredSignal.value = hoveredSignal.value.filter((id) => id != pointerId)
    if (hoveredSignal.value.length === 0) {
      onHoverChange?.(false)
    }
    unsetCursorType(hoveredSignal)
  })
}

const cursorRefStack: Array<unknown> = []
const cursorTypeStack: Array<string> = []

function setCursorType(ref: unknown, type: string): void {
  cursorRefStack.push(ref)
  cursorTypeStack.push(type)
  //console.log('set; curent: ', ...cursorTypeStack)
  document.body.style.cursor = type
}

function unsetCursorType(ref: unknown): void {
  const index = cursorRefStack.indexOf(ref)
  if (index == -1) {
    return
  }
  cursorRefStack.splice(index, 1)
  cursorTypeStack.splice(index, 1)
  //console.log('unset; curent: ', ...cursorTypeStack)
  document.body.style.cursor = cursorTypeStack[cursorTypeStack.length - 1] ?? 'default'
}
