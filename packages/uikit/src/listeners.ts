import { Signal, effect } from '@preact/signals-core'
import { Vector2Tuple } from 'three'
import { Subscriptions } from './utils'
import { ThreeEvent } from './events'

export type Listeners = ScrollListeners & LayoutListeners & ViewportListeners

export function createListeners(): Listeners {
  return {}
}

export function updateListeners(
  target: ScrollListeners & LayoutListeners & ViewportListeners,
  { onIsInViewportChange, onScroll, onSizeChange }: ScrollListeners & LayoutListeners & ViewportListeners,
): void {
  target.onIsInViewportChange = onIsInViewportChange
  target.onScroll = onScroll
  target.onSizeChange = onSizeChange
}

export type ScrollListeners = {
  onScroll?: (scrollX: number, scrollY: number, event?: ThreeEvent<WheelEvent | PointerEvent>) => void
}

export type LayoutListeners = {
  onSizeChange?: (width: number, height: number) => void
}

export type ViewportListeners = {
  onIsInViewportChange?: (isInViewport: boolean) => void
}

export function setupLayoutListeners(
  listeners: LayoutListeners,
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
      listeners.onSizeChange?.(...s)
    }),
  )
}

export function setupViewportListeners(
  listeners: ViewportListeners,
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
      listeners.onIsInViewportChange?.(isInViewport)
    }),
  )
}
