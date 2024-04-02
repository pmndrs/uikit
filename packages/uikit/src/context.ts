import { Signal } from '@preact/signals-core'
import { FlexNode } from './flex'
import { Matrix4, Object3D } from 'three'
import { ClippingRect } from './clipping'
import { OrderInfo, WithCameraDistance } from './order'
import { GlyphGroupManager } from './text/render/instanced-glyph-group'
import { PanelGroupManager } from './panel/instanced-panel-group'

export type WithContext = ElementContext & Readonly<{ root: RootContext }>

export type Object3DRef = { current: Object3D | null }

export type RootContext = WithCameraDistance &
  Readonly<{
    gylphGroupManager: GlyphGroupManager
    panelGroupManager: PanelGroupManager
    pixelSize: number
    onFrameSet: Set<(delta: number) => void>
  }> &
  ElementContext

export type ElementContext = Readonly<{
  node: FlexNode
  clippingRect: Signal<ClippingRect | undefined>
  matrix: Signal<Matrix4 | undefined>
  orderInfo: Signal<OrderInfo>
  object: Object3DRef
}>
