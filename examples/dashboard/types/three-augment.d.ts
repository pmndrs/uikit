declare module 'three' {
  import type { PointerEvent, WheelEvent } from '@pmndrs/pointer-events'
  interface Object3DEventMap {
    pointermove: PointerEvent
    pointercancel: PointerEvent
    pointerdown: PointerEvent
    pointerup: PointerEvent
    pointerenter: PointerEvent
    pointerleave: PointerEvent
    pointerover: PointerEvent
    pointerout: PointerEvent
    click: PointerEvent
    dblclick: PointerEvent
    contextmenu: PointerEvent
    wheel: WheelEvent
  }
}
