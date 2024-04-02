import { Signal, effect } from '@preact/signals-core'
import { Vector2Tuple } from 'three'
import { Subscriptions } from './utils.js'
import { ThreeEvent } from './events.js'

export type Listeners = ScrollListeners & LayoutListeners & ViewportListeners

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
    scrollPosition: Signal<Vector2Tuple>,
    event?: ThreeEvent<WheelEvent | PointerEvent>,
  ) => boolean | void
}

export type LayoutListeners = {
  onSizeChange?: (width: number, height: number) => void
}

export type ViewportListeners = {
  onIsInViewportChange?: (isInViewport: boolean) => void
}

export function setupLayoutListeners(
  listeners: Signal<LayoutListeners>,
  size: Signal<Vector2Tuple>,
  subscriptions: Subscriptions,
) {
  let first = true
  subscriptions.push(
    effect(() => {
      const s = size.value
      if (first) {
        first = false
        return
      }
      listeners.peek().onSizeChange?.(...s)
    }),
  )
}

export function setupViewportListeners(
  listeners: Signal<ViewportListeners>,
  isClipped: Signal<boolean>,
  subscriptions: Subscriptions,
) {
  let first = true
  subscriptions.push(
    effect(() => {
      const isInViewport = !isClipped.value
      if (first) {
        first = false
        return
      }
      listeners.peek().onIsInViewportChange?.(isInViewport)
    }),
  )
}
