import { Signal, effect, signal } from '@preact/signals-core'
import { GetInstancedPanelGroup, InstancedPanelContext } from './panel/react'
import { useContext, useEffect, useMemo } from 'react'
import { InstancedPanel } from './panel/instanced-panel'
import { Vector2Tuple } from 'three'

export function useSelection(
  selectionsSignal: Signal<Array<{ width: number; height: number }>>,
  providedGetGroup?: GetInstancedPanelGroup,
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getGroup = providedGetGroup ?? useContext(InstancedPanelContext)
  const panels = useMemo<Array<{ panel: InstancedPanel; size: Signal<Vector2Tuple>; offset: Signal<Vector2Tuple> }>>(
    () => [],
    [],
  )
  const unsubscribe = useMemo(
    () =>
      effect(() => {
        const selections = selectionsSignal.value
        const selectionsLength = selections.length
        for (let i = 0; i < selectionsLength; i++) {
          let panelData = panels[i]
          if (panelData == null) {
            const size = signal<Vector2Tuple>([0, 0])
            const offset = signal<Vector2Tuple>([0, 0])
            panels[i] = panelData = {
              panel: new InstancedPanel(
                getGroup(majorIndex, panelGroupDependencies),
                matrix,
                size,
                offset,
                noBorder,
                parentClippingRect,
                isHidden,
                minorIndex,
              ),
              offset,
              size,
            }
          }
        }
        const panelsLength = panels.length
        for (let i = selectionsLength; i < panelsLength; i++) {
          panels[i].panel.destroy()
        }
        panels.length = selectionsLength
      }),
    [selectionsSignal, panels, getGroup],
  )
  useEffect(
    () => () => {
      unsubscribe()
      const panelsLength = panels.length
      for (let i = 0; i < panelsLength; i++) {
        panels[i].panel.destroy()
      }
    },
    [unsubscribe, panels],
  )
}
