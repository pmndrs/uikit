import { Signal, effect, signal } from '@preact/signals-core'
import { PanelProperties, createInstancedPanel } from './panel/instanced-panel.js'
import { Matrix4, Vector2Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { ElementType, OrderInfo, computedOrderInfo } from './order.js'
import { Inset } from './flex/index.js'
import {
  ColorRepresentation,
  MergedProperties,
  PanelGroupManager,
  PanelMaterialConfig,
  Subscriptions,
  computedBorderInset,
  createPanelMaterialConfig,
  defaultPanelDependencies,
  unsubscribeSubscriptions,
} from './internals.js'

export type SelectionBoxes = Array<{ size: Vector2Tuple; position: Vector2Tuple }>

export type SelectionBorderSizeProperties = {
  selectionBorderRight?: number
  selectionBorderTop?: number
  selectionBorderLeft?: number
  selectionBorderBottom?: number
}

const selectionBorderKeys = [
  'selectionBorderRight',
  'selectionBorderTop',
  'selectionBorderLeft',
  'selectionBorderBottom',
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
  selectionBoxes: Signal<SelectionBoxes>,
  isHidden: Signal<boolean> | undefined,
  prevOrderInfo: Signal<OrderInfo>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  panelGroupManager: PanelGroupManager,
  subscriptions: Subscriptions,
): Signal<OrderInfo> {
  const panels: Array<{
    size: Signal<Vector2Tuple>
    offset: Signal<Vector2Tuple>
    panelSubscriptions: Subscriptions
  }> = []
  const orderInfo = computedOrderInfo(undefined, ElementType.Panel, defaultPanelDependencies, prevOrderInfo)
  const borderInset = computedBorderInset(propertiesSignal, selectionBorderKeys)

  subscriptions.push(
    effect(() => {
      const selections = selectionBoxes.value
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
            isHidden,
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
    () => {
      const panelsLength = panels.length
      for (let i = 0; i < panelsLength; i++) {
        unsubscribeSubscriptions(panels[i].panelSubscriptions)
      }
    },
  )
  return orderInfo
}
