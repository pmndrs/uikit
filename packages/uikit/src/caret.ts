import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Matrix4, Vector3Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { ElementType, OrderInfo, computedOrderInfo } from './order.js'
import { Inset } from './flex/index.js'
import { PanelProperties, createInstancedPanel } from './panel/instanced-panel.js'
import {
  ColorRepresentation,
  MergedProperties,
  PanelGroupManager,
  PanelMaterialConfig,
  Subscriptions,
  computedBorderInset,
  createGetBatchedProperties,
  createPanelMaterialConfig,
} from './internals.js'

const caretWidthKeys = ['caretWidth'] as const

export type CaretWidthProperties = {
  caretWidth?: number
}

export type CaretBorderSizeProperties = {
  caretBorderRight?: number
  caretBorderTop?: number
  caretBorderLeft?: number
  caretBorderBottom?: number
}

const caretBorderKeys = ['caretBorderRight', 'caretBorderTop', 'caretBorderLeft', 'caretBorderBottom']

export type CaretProperties = {
  caretOpacity?: number
  caretColor?: ColorRepresentation
} & CaretWidthProperties &
  CaretBorderSizeProperties & {
    [Key in Exclude<
      keyof PanelProperties,
      'backgroundColor' | 'backgroundOpacity'
    > as `caret${Capitalize<Key>}`]: PanelProperties[Key]
  }

let caretMaterialConfig: PanelMaterialConfig | undefined
function getCaretMaterialConfig() {
  caretMaterialConfig ??= createPanelMaterialConfig(
    {
      backgroundColor: 'caretColor',
      backgroundOpacity: 'caretOpacity',
      borderBend: 'caretBorderBend',
      borderBottomLeftRadius: 'caretBorderBottomLeftRadius',
      borderBottomRightRadius: 'caretBorderBottomRightRadius',
      borderColor: 'caretBorderColor',
      borderOpacity: 'caretBorderOpacity',
      borderTopLeftRadius: 'caretBorderTopLeftRadius',
      borderTopRightRadius: 'caretBorderTopRightRadius',
    },
    {
      backgroundColor: 0xffffff,
      backgroundOpacity: 1,
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
  const getCaretWidth = createGetBatchedProperties<CaretWidthProperties>(propertiesSignal, caretWidthKeys)
  const borderInset = computedBorderInset(propertiesSignal, caretBorderKeys)
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
      return [getCaretWidth('caretWidth') ?? 1.5, size[2]]
    }),
    computed(() => {
      const position = blinkingCaretPosition.value
      if (position == null) {
        return [0, 0]
      }
      return [position[0] - (getCaretWidth('caretWidth') ?? 1.5) / 2, position[1]]
    }),
    borderInset,
    parentClippingRect,
    isHidden,
    getCaretMaterialConfig(),
    subscriptions,
  )
}
