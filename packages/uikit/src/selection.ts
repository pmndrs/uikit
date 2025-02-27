import { Signal, effect, signal } from '@preact/signals-core'
import { PanelProperties, createInstancedPanel } from './panel/instanced-panel.js'
import { Matrix4, Vector2Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { ElementType, OrderInfo, computedOrderInfo } from './order.js'
import {
  ColorRepresentation,
  Initializers,
  Subscriptions,
  computedBorderInset,
  unsubscribeSubscriptions,
} from './utils.js'
import {
  PanelGroupManager,
  PanelMaterialConfig,
  createPanelMaterialConfig,
  defaultPanelDependencies,
} from './panel/index.js'
import { MergedProperties } from './properties/index.js'

export type SelectionTransformation = { size: Vector2Tuple; position: Vector2Tuple }

export type SelectionBorderSizeProperties = {
  selectionBorderRightWidth?: number
  selectionBorderTopWidth?: number
  selectionBorderLeftWidth?: number
  selectionBorderBottomWidth?: number
}

const selectionBorderKeys = [
  'selectionBorderRightWidth',
  'selectionBorderTopWidth',
  'selectionBorderLeftWidth',
  'selectionBorderBottomWidth',
]

export type SelectionProperties = {
  selectionOpacity?: number
  selectionColor?: ColorRepresentation
} & SelectionBorderSizeProperties & {
    [Key in Exclude<
      keyof PanelProperties,
      'backgroundColor' | 'backgroundOpacity'
    > as `selection${Capitalize<Key>}`]: PanelProperties[Key]
  }

let selectionMaterialConfig: PanelMaterialConfig | undefined
function getSelectionMaterialConfig() {
  selectionMaterialConfig ??= createPanelMaterialConfig(
    {
      backgroundColor: 'selectionColor',
      backgroundOpacity: 'selectionOpacity',
      borderBend: 'selectionBorderBend',
      borderBottomLeftRadius: 'selectionBorderBottomLeftRadius',
      borderBottomRightRadius: 'selectionBorderBottomRightRadius',
      borderColor: 'selectionBorderColor',
      borderOpacity: 'selectionBorderOpacity',
      borderTopLeftRadius: 'selectionBorderTopLeftRadius',
      borderTopRightRadius: 'selectionBorderTopRightRadius',
    },
    {
      backgroundColor: 0xb4d7ff,
      backgroundOpacity: 1,
    },
  )
  return selectionMaterialConfig
}

export function createSelection(
  propertiesSignal: Signal<MergedProperties>,
  matrix: Signal<Matrix4 | undefined>,
  selectionTransformations: Signal<Array<SelectionTransformation>>,
  isVisible: Signal<boolean>,
  prevOrderInfo: Signal<OrderInfo | undefined>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  panelGroupManager: PanelGroupManager,
  initializers: Initializers,
) {
  const panels: Array<{
    size: Signal<Vector2Tuple>
    offset: Signal<Vector2Tuple>
    panelSubscriptions: Subscriptions
  }> = []
  const orderInfo = computedOrderInfo(
    undefined,
    'zIndexOffset',
    ElementType.Panel,
    defaultPanelDependencies,
    prevOrderInfo,
  )
  const borderInset = computedBorderInset(propertiesSignal, selectionBorderKeys)

  initializers.push(
    () =>
      effect(() => {
        const selections = selectionTransformations.value
        const selectionsLength = selections.length
        for (let i = 0; i < selectionsLength; i++) {
          let panelData = panels[i]
          if (panelData == null) {
            const size = signal<Vector2Tuple>([0, 0])
            const offset = signal<Vector2Tuple>([0, 0])
            const panelSubscriptions: Subscriptions = []
            createInstancedPanel(
              propertiesSignal,
              orderInfo,
              undefined,
              panelGroupManager,
              matrix,
              size,
              offset,
              borderInset,
              parentClippingRect,
              isVisible,
              getSelectionMaterialConfig(),
              panelSubscriptions,
            )
            panels[i] = panelData = {
              panelSubscriptions,
              offset,
              size,
            }
          }
          const selection = selections[i]
          panelData.size.value = selection.size
          panelData.offset.value = selection.position
        }
        const panelsLength = panels.length
        for (let i = selectionsLength; i < panelsLength; i++) {
          unsubscribeSubscriptions(panels[i].panelSubscriptions)
        }
        panels.length = selectionsLength
      }),
    () => () => {
      const panelsLength = panels.length
      for (let i = 0; i < panelsLength; i++) {
        unsubscribeSubscriptions(panels[i].panelSubscriptions)
      }
    },
  )
  return orderInfo
}
