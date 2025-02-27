import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Matrix4, Vector2Tuple } from 'three'
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

export type CaretTransformation = {
  position: Vector2Tuple
  height: number
}

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
  caretTransformation: Signal<CaretTransformation | undefined>,
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
  const blinkingCaretTransformation = signal<CaretTransformation | undefined>(undefined)
  initializers.push(() =>
    effect(() => {
      const pos = caretTransformation.value
      if (pos == null) {
        blinkingCaretTransformation.value = undefined
      }
      blinkingCaretTransformation.value = pos
      const ref = setInterval(
        () => (blinkingCaretTransformation.value = blinkingCaretTransformation.peek() == null ? pos : undefined),
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
        const height = blinkingCaretTransformation.value?.height
        if (height == null) {
          return [0, 0]
        }
        return [caretWidth.value, height]
      }),
      computed(() => {
        const position = blinkingCaretTransformation.value?.position
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
