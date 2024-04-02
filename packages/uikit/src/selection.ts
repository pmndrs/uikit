import { Signal, effect, signal } from '@preact/signals-core'
import { useMemo } from 'react'
import { createInstancedPanel } from './panel/instanced-panel.js'
import { Matrix4, Vector2Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { ElementType, OrderInfo, computedOrderInfo } from './order.js'
import { Inset } from './flex/index.js'
import {
  MergedProperties,
  PanelGroupManager,
  PanelMaterialConfig,
  Subscriptions,
  createPanelMaterialConfig,
  unsubscribeSubscriptions,
} from './internals.js'

const noBorder = signal<Inset>([0, 0, 0, 0])

export type SelectionBoxes = Array<{ size: Vector2Tuple; position: Vector2Tuple }>

let selectionMaterialConfig: PanelMaterialConfig | undefined
function getSelectionMaterialConfig() {
  selectionMaterialConfig ??= createPanelMaterialConfig(
    {
      backgroundColor: 'selectionColor',
      backgroundOpacity: 'selectionOpacity',
    },
    {
      backgroundColor: 0xb4d7ff,
      backgroundOpacity: 1,
    },
  )
  return selectionMaterialConfig
}

export function useSelection(
  propertiesSignal: Signal<MergedProperties>,
  matrix: Signal<Matrix4 | undefined>,
  selectionBoxes: Signal<SelectionBoxes>,
  isHidden: Signal<boolean> | undefined,
  parentOrderInfo: Signal<OrderInfo>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  panelGroupManager: PanelGroupManager,
  subscriptions: Subscriptions,
): Signal<OrderInfo> {
  const panels = useMemo<
    Array<{
      size: Signal<Vector2Tuple>
      offset: Signal<Vector2Tuple>
      panelSubscriptions: Subscriptions
    }>
  >(() => [], [])
  const orderInfo = computedOrderInfo(undefined, ElementType.Panel, undefined, parentOrderInfo)

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
            noBorder,
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
