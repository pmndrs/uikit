import { Signal } from '@preact/signals-core'
import { Vector2Tuple } from 'three'
import { ThreeMouseEvent, ThreePointerEvent } from './events.js'

export type Listeners = ScrollListeners & HoverListeners & ActiveListeners

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

export type HoverListeners = {
  onHoverChange?: (hover: boolean) => void
}
export type ActiveListeners = {
  onActiveChange?: (active: boolean) => void
}
