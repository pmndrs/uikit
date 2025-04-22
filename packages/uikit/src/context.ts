import { Signal } from '@preact/signals-core'
import { Matrix4 } from 'three'
import { ClippingRect } from './clipping.js'
import { OrderInfo } from './order.js'
import { FlexNode } from './flex/index.js'
import { Properties } from './properties/index.js'
import { FontFamilies } from './text/font.js'
import { RootContext } from './components/root.js'

export type ParentContext = Readonly<{
  isRoot: boolean
  node: Signal<FlexNode | undefined>
  anyAncestorScrollable: Signal<readonly [boolean, boolean]>
  ancestorsHaveListeners: Signal<boolean>
  clippingRect: Signal<ClippingRect | undefined>
  childrenMatrix: Signal<Matrix4 | undefined>
  orderInfo: Signal<OrderInfo | undefined>
  root: RootContext
  properties: Properties
  fontFamilies: Signal<FontFamilies | undefined>
}>
