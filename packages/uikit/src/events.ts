import { Intersection, Object3DEventMap } from 'three'

declare module 'three' {
  interface Object3DEventMap {
    childadded: { child: Object3D }
    childremoved: { child: Object3D }
    click: ThreeMouseEvent
    contextmenu: ThreeMouseEvent
    dblclick: ThreeMouseEvent

    wheel: ThreeMouseEvent

    pointerup: ThreePointerEvent
    pointerdown: ThreePointerEvent
    pointerover: ThreePointerEvent
    pointerout: ThreePointerEvent
    pointerenter: ThreePointerEvent
    pointerleave: ThreePointerEvent
    pointermove: ThreePointerEvent
    pointercancel: ThreePointerEvent
  }
}

export type ThreeMouseEvent = Intersection & {
  nativeEvent?: unknown
  stopPropagation?: () => void
  stopImmediatePropagation?: () => void
}

export type ThreePointerEvent = ThreeMouseEvent & { pointerId?: number }

export type EventHandlersProperties = {
  onClick?: (event: Object3DEventMap['click']) => void
  onContextMenu?: (event: Object3DEventMap['contextmenu']) => void
  onDblClick?: (event: Object3DEventMap['dblclick']) => void

  onWheel?: (event: Object3DEventMap['wheel']) => void

  onPointerUp?: (event: Object3DEventMap['pointerup']) => void
  onPointerDown?: (event: Object3DEventMap['pointerdown']) => void
  onPointerOver?: (event: Object3DEventMap['pointerover']) => void
  onPointerOut?: (event: Object3DEventMap['pointerout']) => void
  onPointerEnter?: (event: Object3DEventMap['pointerenter']) => void
  onPointerLeave?: (event: Object3DEventMap['pointerleave']) => void
  onPointerMove?: (event: Object3DEventMap['pointermove']) => void
  onPointerCancel?: (event: Object3DEventMap['pointercancel']) => void
}
