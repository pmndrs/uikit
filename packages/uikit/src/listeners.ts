import { Signal, effect } from '@preact/signals-core'
import { Vector2Tuple } from 'three'
import { ThreeMouseEvent, ThreePointerEvent } from './events.js'
import { abortableEffect } from './utils.js'

export type Listeners = ScrollListeners & LayoutListeners & ClippedListeners

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

export function setupLayoutListeners(
  l1: Signal<LayoutListeners | undefined>,
  l2: Signal<LayoutListeners | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    const s = size.value
    if (s == null) {
      return
    }
    l1.peek()?.onSizeChange?.(...s)
    l2.peek()?.onSizeChange?.(...s)
  }, abortSignal)
}

export function setupClippedListeners(
  l1: Signal<ClippedListeners | undefined>,
  l2: Signal<ClippedListeners | undefined>,
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
    l1.peek()?.onIsClippedChange?.(isClipped)
    l2.peek()?.onIsClippedChange?.(isClipped)
  }, abortSignal)
}
