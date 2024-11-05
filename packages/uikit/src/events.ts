import { Intersection } from 'three'

export type ThreeMouseEvent = Intersection & {
  nativeEvent: unknown
  stopPropagation?: () => void
  stopImmediatePropagation?: () => void
}

export type ThreePointerEvent = ThreeMouseEvent & { pointerId: number }

export type ThreeEventMap = {
  mouse: ThreeMouseEvent
  wheel: ThreeMouseEvent
  pointer: ThreePointerEvent
}

export type EventHandlers<EM extends ThreeEventMap = ThreeEventMap> = {
  onClick?: (event: EM['mouse']) => void
  onContextMenu?: (event: EM['mouse']) => void
  onDoubleClick?: (event: EM['mouse']) => void

  onWheel?: (event: EM['wheel']) => void

  onPointerUp?: (event: EM['pointer']) => void
  onPointerDown?: (event: EM['pointer']) => void
  onPointerOver?: (event: EM['pointer']) => void
  onPointerOut?: (event: EM['pointer']) => void
  onPointerEnter?: (event: EM['pointer']) => void
  onPointerLeave?: (event: EM['pointer']) => void
  onPointerMove?: (event: EM['pointer']) => void
  onPointerCancel?: (event: EM['pointer']) => void
}
