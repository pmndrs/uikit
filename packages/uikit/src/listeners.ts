import { Signal, effect } from '@preact/signals-core'
import { Vector2Tuple } from 'three'
import { Subscriptions } from './utils'

export type LayoutListeners = {
  onSizeChange?: (width: number, height: number) => void
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

export type ViewportListeners = {
  onIsInViewportChange?: (isInViewport: boolean) => void
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
