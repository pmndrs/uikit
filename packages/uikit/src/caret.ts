import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Matrix4, Vector3Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { ElementType, OrderInfo, computedOrderInfo } from './order.js'
import { Inset } from './flex/index.js'
import { createInstancedPanel } from './panel/instanced-panel.js'
import {
  MergedProperties,
  PanelGroupManager,
  PanelMaterialConfig,
  Subscriptions,
  createPanelMaterialConfig,
} from './internals.js'

const noBorder = signal<Inset>([0, 0, 0, 0])

const CARET_WIDTH = 1.5

let caretMaterialConfig: PanelMaterialConfig | undefined
function getCaretMaterialConfig() {
  caretMaterialConfig ??= createPanelMaterialConfig(
    {
      backgroundColor: 'color',
      backgroundOpacity: 'opacity',
    },
    {
      backgroundColor: 0xffffff,
    },
  )
  return caretMaterialConfig
}

export function createCaret(
  propertiesSignal: Signal<MergedProperties>,
  matrix: Signal<Matrix4 | undefined>,
  caretPosition: Signal<Vector3Tuple | undefined>,
  isHidden: Signal<boolean> | undefined,
  parentOrderInfo: Signal<OrderInfo>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  panelGroupManager: PanelGroupManager,
  subscriptions: Subscriptions,
) {
  const orderInfo = computedOrderInfo(undefined, ElementType.Panel, undefined, parentOrderInfo)
  const blinkingCaretPosition = signal<Vector3Tuple | undefined>(undefined)
  subscriptions.push(
    effect(() => {
      const pos = caretPosition.value
      if (pos == null) {
        blinkingCaretPosition.value = undefined
      }
      blinkingCaretPosition.value = pos
      const ref = setInterval(
        () => (blinkingCaretPosition.value = blinkingCaretPosition.peek() == null ? pos : undefined),
        500,
      )
      return () => clearInterval(ref)
    }),
  )
  createInstancedPanel(
    propertiesSignal,
    orderInfo,
    undefined,
    panelGroupManager,
    matrix,
    computed(() => {
      const size = blinkingCaretPosition.value
      if (size == null) {
        return [0, 0]
      }
      return [CARET_WIDTH, size[2]]
    }),
    computed(() => {
      const position = blinkingCaretPosition.value
      if (position == null) {
        return [0, 0]
      }
      return [position[0] - CARET_WIDTH / 2, position[1]]
    }),
    noBorder,
    parentClippingRect,
    isHidden,
    getCaretMaterialConfig(),
    subscriptions,
  )
}
