import { Intersection, Object3DEventMap } from 'three'

declare module 'three' {
  interface Object3DEventMap {
    childadded: { child: Object3D }
    childremoved: { child: Object3D }
    click: ThreeMouseEvent
    contextMenu: ThreeMouseEvent
    dblClick: ThreeMouseEvent

    wheel: ThreeMouseEvent

    pointerUp: ThreePointerEvent
    pointerDown: ThreePointerEvent
    pointerOver: ThreePointerEvent
    pointerOut: ThreePointerEvent
    pointerEnter: ThreePointerEvent
    pointerLeave: ThreePointerEvent
    pointerMove: ThreePointerEvent
    pointerCancel: ThreePointerEvent
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
  onContextMenu?: (event: Object3DEventMap['contextMenu']) => void
  onDblClick?: (event: Object3DEventMap['dblClick']) => void

  onWheel?: (event: Object3DEventMap['wheel']) => void

  onPointerUp?: (event: Object3DEventMap['pointerUp']) => void
  onPointerDown?: (event: Object3DEventMap['pointerDown']) => void
  onPointerOver?: (event: Object3DEventMap['pointerOver']) => void
  onPointerOut?: (event: Object3DEventMap['pointerOut']) => void
  onPointerEnter?: (event: Object3DEventMap['pointerEnter']) => void
  onPointerLeave?: (event: Object3DEventMap['pointerLeave']) => void
  onPointerMove?: (event: Object3DEventMap['pointerMove']) => void
  onPointerCancel?: (event: Object3DEventMap['pointerCancel']) => void
}
