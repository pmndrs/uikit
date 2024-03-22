import { Signal } from '@preact/signals-core'
import { FlexNode } from './flex'
import { Matrix4, Object3D } from 'three'
import { ClippingRect } from './clipping'
import { OrderInfo, WithCameraDistance } from './order'
import { GlyphGroupManager } from './text/render/instanced-glyph-group'
import { PanelGroupManager } from './panel/instanced-panel-group'
import { EventHandlers } from './events'

export type BindEventHandlers = (object: Object3D, handlers: EventHandlers) => void

export type UnbindEventHandlers = (object: Object3D, handlers: EventHandlers) => void

export type WithContext = ElementContext & Readonly<{ root: RootContext }>

export type Object3DRef = { current: Object3D | null }

export type RootContext = WithCameraDistance &
  Readonly<{
    gylphGroupManager: GlyphGroupManager
    panelGroupManager: PanelGroupManager
    pixelSize: number
    onFrameSet: Set<(delta: number) => void>
    bindEventHandlers: BindEventHandlers
    unbindEventHandlers: UnbindEventHandlers
  }> &
  ElementContext

export type ElementContext = Readonly<{
  node: FlexNode
  clippingRect: Signal<ClippingRect | undefined>
  isClipped: Signal<boolean>
  matrix: Signal<Matrix4 | undefined>
  orderInfo: Signal<OrderInfo>
  object: Object3DRef
}>
