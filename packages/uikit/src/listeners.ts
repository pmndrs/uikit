import { Signal, effect } from '@preact/signals-core'
import { Vector2Tuple } from 'three'
import { Subscriptions } from './utils'
import { ThreeEvent } from './events'

export type Listeners = ScrollListeners & LayoutListeners & ViewportListeners

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
