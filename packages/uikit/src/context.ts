import { Signal } from '@preact/signals-core'
import { Matrix4, Object3D, Vector2Tuple, WebGLRenderer } from 'three'
import { ClippingRect } from './clipping.js'
import { OrderInfo, WithCameraDistance } from './order.js'
import { GlyphGroupManager } from './text/render/instanced-glyph-group.js'
import { PanelGroupManager } from './panel/instanced-panel-group.js'
import { FlexNode } from './flex/index.js'

export type ParentContext = Readonly<{
  node: Signal<FlexNode | undefined>
  anyAncestorScrollable: Signal<readonly [boolean, boolean]>
  clippingRect: Signal<ClippingRect | undefined>
  childrenMatrix: Signal<Matrix4 | undefined>
  orderInfo: Signal<OrderInfo | undefined>
  root: RootContext
}>

export type Object3DRef = { current?: Object3D | null }

export type RootContext = WithCameraDistance &
  Readonly<{
    requestCalculateLayout: () => void
    object: Object3DRef
    gylphGroupManager: GlyphGroupManager
    panelGroupManager: PanelGroupManager
    pixelSize: Signal<number>
    renderOrder: Signal<number>
    depthTest: Signal<boolean>
    onFrameSet: Set<(delta: number) => void>
    onUpdateMatrixWorldSet: Set<() => void>
    interactableDescendants: Array<Object3D>
    renderer: WebGLRenderer
    size: Signal<Vector2Tuple | undefined>
    requestRender: () => void
    requestFrame: () => void
  }>
