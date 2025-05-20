import { ReadonlySignal, Signal, computed, signal } from '@preact/signals-core'
import { Matrix4, Vector2Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { setupOrderInfo, ElementType, OrderInfo } from './order.js'
import { PanelProperties, setupInstancedPanel } from './panel/instanced-panel.js'
import { abortableEffect, ColorRepresentation, computedBorderInset } from './utils.js'
import {
  PanelGroupProperties,
  PanelMaterialConfig,
  computedPanelMatrix,
  createPanelMaterialConfig,
} from './panel/index.js'
import { Properties } from './properties/index.js'
import { RootContext } from './context.js'

export type CaretTransformation = {
  position: Vector2Tuple
  height: number
}

type CaretWidthProperties = {
  caretWidth?: number
}

type CaretBorderSizeProperties = {
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
    > as `caret${Capitalize<Key>}`]?: PanelProperties[Key]
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

export function setupCaret(
  properties: Properties,
  globalMatrix: Signal<Matrix4 | undefined>,
  caretTransformation: Signal<CaretTransformation | undefined>,
  isVisible: Signal<boolean>,
  parentOrderInfo: Signal<OrderInfo | undefined>,
  parentGroupDeps: ReadonlySignal<Required<PanelGroupProperties>>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  root: Signal<RootContext>,
  abortSignal: AbortSignal,
) {
  const orderInfo = signal<OrderInfo | undefined>(undefined)
  setupOrderInfo(orderInfo, undefined, 'zIndexOffset', ElementType.Panel, parentGroupDeps, parentOrderInfo, abortSignal)
  const blinkingCaretTransformation = signal<CaretTransformation | undefined>(undefined)
  abortableEffect(() => {
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
  }, abortSignal)
  const borderInset = computedBorderInset(properties, caretBorderKeys)

  const panelSize = computed<Vector2Tuple>(() => {
    const height = blinkingCaretTransformation.value?.height
    if (height == null) {
      return [0, 0]
    }
    return [properties.value.caretWidth, height]
  })
  const panelOffset = computed<Vector2Tuple>(() => {
    const position = blinkingCaretTransformation.value?.position
    if (position == null) {
      return [0, 0]
    }
    return [position[0] - properties.value.caretWidth / 2, position[1]]
  })

  const panelMatrix = computedPanelMatrix(properties, globalMatrix, panelSize, panelOffset)

  setupInstancedPanel(
    properties,
    root,
    orderInfo,
    parentGroupDeps,
    panelMatrix,
    panelSize,
    borderInset,
    parentClippingRect,
    isVisible,
    getCaretMaterialConfig(),
    abortSignal,
  )
}
