import { Signal, effect, signal } from '@preact/signals-core'
import { GetInstancedPanelGroup, useGetInstancedPanelGroup, usePanelGroupDependencies } from './panel/react.js'
import { useEffect, useMemo } from 'react'
import { InstancedPanel } from './panel/instanced-panel.js'
import { Matrix4, Vector2Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { ElementType, OrderInfo, useOrderInfo } from './order.js'
import { Inset } from './flex/index.js'

const noBorder = signal<Inset>([0, 0, 0, 0])

export type SelectionBoxes = Array<{ size: Vector2Tuple; position: Vector2Tuple }>

export function useSelection(
  matrix: Signal<Matrix4 | undefined>,
  selectionBoxes: Signal<SelectionBoxes>,
  isHidden: Signal<boolean> | undefined,
  parentOrderInfo: OrderInfo,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  providedGetGroup?: GetInstancedPanelGroup,
): OrderInfo {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getGroup = providedGetGroup ?? useGetInstancedPanelGroup()
  const panels = useMemo<
    Array<{ panel: InstancedPanel; size: Signal<Vector2Tuple>; offset: Signal<Vector2Tuple>; unsubscribe: () => void }>
  >(() => [], [])
  const groupDeps = usePanelGroupDependencies(undefined, { castShadow: false, receiveShadow: false })
  const orderInfo = useOrderInfo(ElementType.Panel, undefined, groupDeps, parentOrderInfo)
  const unsubscribe = useMemo(
    () =>
      effect(() => {
        const selections = selectionBoxes.value
        const selectionsLength = selections.length
        for (let i = 0; i < selectionsLength; i++) {
          let panelData = panels[i]
          if (panelData == null) {
            const size = signal<Vector2Tuple>([0, 0])
            const offset = signal<Vector2Tuple>([0, 0])
            const panel = new InstancedPanel(
              getGroup(orderInfo.majorIndex, groupDeps),
              matrix,
              size,
              offset,
              noBorder,
              parentClippingRect,
              isHidden,
              orderInfo.minorIndex,
            )
            panel.getProperty.value = (key) => {
              if (key === 'backgroundColor') {
                return 0xb4d7ff as any
              }
              if (key === 'backgroundOpacity') {
                return 1
              }
              return undefined
            }
            const unsubscribe = effect(() => {
              if (panel.active.value) {
                panel.setProperty('backgroundColor', 0xb4d7ff)
                panel.setProperty('backgroundOpacity', 1)
              }
            })
            panels[i] = panelData = {
              unsubscribe,
              panel,
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
          panels[i].unsubscribe()
          panels[i].panel.destroy()
        }
        panels.length = selectionsLength
      }),
    [selectionBoxes, panels, getGroup, orderInfo, groupDeps, matrix, parentClippingRect, isHidden],
  )
  useEffect(
    () => () => {
      unsubscribe()
      const panelsLength = panels.length
      for (let i = 0; i < panelsLength; i++) {
        panels[i].unsubscribe()
        panels[i].panel.destroy()
      }
    },
    [unsubscribe, panels],
  )
  return orderInfo
}
