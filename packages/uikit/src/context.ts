import { Signal } from '@preact/signals-core'
import { FlexNode } from './flex/index.js'
import { Matrix4, Object3D, WebGLRenderer } from 'three'
import { ClippingRect } from './clipping.js'
import { OrderInfo, WithCameraDistance } from './order.js'
import { GlyphGroupManager } from './text/render/instanced-glyph-group.js'
import { PanelGroupManager } from './panel/instanced-panel-group.js'

export type WithContext = ElementContext & Readonly<{ root: RootContext }>

export type Object3DRef = { current: Object3D | null }

export type RootContext = WithCameraDistance &
  Readonly<{
    gylphGroupManager: GlyphGroupManager
    panelGroupManager: PanelGroupManager
    pixelSize: number
    onFrameSet: Set<(delta: number) => void>
    renderer: WebGLRenderer
  }> &
  ElementContext

export type ElementContext = Readonly<{
  node: FlexNode
  clippingRect: Signal<ClippingRect | undefined>
  childrenMatrix: Signal<Matrix4 | undefined>
  orderInfo: Signal<OrderInfo>
  object: Object3DRef
}>
