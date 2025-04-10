import { Signal } from '@preact/signals-core'
import { Vector2Tuple } from 'three'
import { ThreeMouseEvent, ThreePointerEvent } from './events.js'
import { abortableEffect } from './utils.js'
import { Properties } from './properties/index.js'

export type Listeners = ScrollListeners & LayoutListeners & ClippedListeners & HoverListeners & ActiveListeners

export type ScrollListeners = {
  /**
   * scroll listener called right before the new scroll position is set when a scroll event is caused
   * @param scrollX the new scroll x position
   * @param scrollY the new scroll y position
   * @param scrollPosition the current/old scroll position
   * @param event the event that caused the scrolling
   * @returns false to prevent the new scroll x and scroll y position from beeing applied
   */
  onScroll?: (
    scrollX: number,
    scrollY: number,
    scrollPosition: Signal<Vector2Tuple | undefined>,
    event?: ThreePointerEvent | ThreeMouseEvent,
  ) => boolean | void
}

export type LayoutListeners = {
  onSizeChange?: (width: number, height: number) => void
}

export type ClippedListeners = {
  onIsClippedChange?: (isClipped: boolean) => void
}

export type HoverListeners = {
  onHoverChange?: (hover: boolean) => void
}
export type ActiveListeners = {
  onActiveChange?: (active: boolean) => void
}

export function setupLayoutListeners(
  properties: Properties,
  size: Signal<Vector2Tuple | undefined>,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    const s = size.value
    if (s == null) {
      return
    }
    properties.peek('onSizeChange')?.(...s)
  }, abortSignal)
}

export function setupClippedListeners(
  properties: Properties,
  isClippedSignal: Signal<boolean>,
  abortSignal: AbortSignal,
) {
  let first = true
  abortableEffect(() => {
    const isClipped = isClippedSignal.value
    if (first) {
      first = false
      return
    }
    properties.peek('onIsClippedChange')?.(isClipped)
  }, abortSignal)
}
