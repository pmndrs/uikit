import { ReadonlySignal, Signal, signal } from '@preact/signals-core'
import { PanelProperties, setupInstancedPanel } from './panel/instanced-panel.js'
import { Matrix4, Vector2Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { computedOrderInfo, ElementType, OrderInfo } from './order.js'
import { abortableEffect, ColorRepresentation, computedBorderInset } from './utils.js'
import {
  PanelGroupManager,
  PanelGroupProperties,
  PanelMaterialConfig,
  createPanelMaterialConfig,
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
  prevPanelDeps: ReadonlySignal<Required<PanelGroupProperties>>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  panelGroupManager: PanelGroupManager,
  abortSignal: AbortSignal,
) {
  const panels: Array<{
    size: Signal<Vector2Tuple>
    offset: Signal<Vector2Tuple>
    abortController: AbortController
  }> = []
  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Panel, prevPanelDeps, prevOrderInfo)
  const borderInset = computedBorderInset(propertiesSignal, selectionBorderKeys)

  abortableEffect(() => {
    const selections = selectionTransformations.value
    const selectionsLength = selections.length
    for (let i = 0; i < selectionsLength; i++) {
      let panelData = panels[i]
      if (panelData == null) {
        const size = signal<Vector2Tuple>([0, 0])
        const offset = signal<Vector2Tuple>([0, 0])
        const abortController = new AbortController()
        setupInstancedPanel(
          propertiesSignal,
          orderInfo,
          prevPanelDeps,
          panelGroupManager,
          matrix,
          size,
          offset,
          borderInset,
          parentClippingRect,
          isVisible,
          getSelectionMaterialConfig(),
          abortController.signal,
        )
        panels[i] = panelData = {
          abortController,
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
      panels[i].abortController.abort()
    }
    panels.length = selectionsLength
  }, abortSignal)
  abortSignal.addEventListener('abort', () => {
    const panelsLength = panels.length
    for (let i = 0; i < panelsLength; i++) {
      panels[i].abortController.abort()
    }
  })
}
