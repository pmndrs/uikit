import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Matrix4, Vector3Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { ElementType, OrderInfo, computedOrderInfo } from './order.js'
import { PanelProperties, createInstancedPanel } from './panel/instanced-panel.js'
import { ColorRepresentation, Initializers, computedBorderInset } from './utils.js'
import {
  PanelGroupManager,
  PanelMaterialConfig,
  createPanelMaterialConfig,
  defaultPanelDependencies,
} from './panel/index.js'
import { MergedProperties, computedInheritableProperty } from './properties/index.js'

export type CaretWidthProperties = {
  caretWidth?: number
}

export type CaretBorderSizeProperties = {
  caretBorderRightWidth?: number
  caretBorderTopWidth?: number
  caretBorderLeftWidth?: number
  caretBorderBottomWidth?: number
}

const caretBorderKeys = [
  'caretBorderRightWidth',
  'caretBorderTopWidth',
  'caretBorderLeftWidth',
  'caretBorderBottomWidth',
]

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
      backgroundColor: 0x0,
      backgroundOpacity: 1,
    },
  )
  return caretMaterialConfig
}

export function createCaret(
  propertiesSignal: Signal<MergedProperties>,
  matrix: Signal<Matrix4 | undefined>,
  caretPosition: Signal<Vector3Tuple | undefined>,
  isVisible: Signal<boolean>,
  parentOrderInfo: Signal<OrderInfo | undefined>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  panelGroupManager: PanelGroupManager,
  initializers: Initializers,
) {
  const orderInfo = computedOrderInfo(
    undefined,
    'zIndexOffset',
    ElementType.Panel,
    defaultPanelDependencies,
    parentOrderInfo,
  )
  const blinkingCaretPosition = signal<Vector3Tuple | undefined>(undefined)
  initializers.push(() =>
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
  const borderInset = computedBorderInset(propertiesSignal, caretBorderKeys)
  const caretWidth = computedInheritableProperty(propertiesSignal, 'caretWidth', 1.5)

  initializers.push((subscriptions) =>
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
        return [caretWidth.value, size[2]]
      }),
      computed(() => {
        const position = blinkingCaretPosition.value
        if (position == null) {
          return [0, 0]
        }
        return [position[0] - caretWidth.value / 2, position[1]]
      }),
      borderInset,
      parentClippingRect,
      isVisible,
      getCaretMaterialConfig(),
      subscriptions,
    ),
  )
}
