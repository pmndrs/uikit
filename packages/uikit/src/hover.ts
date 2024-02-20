import { signal } from '@preact/signals-core'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { useEffect, useMemo } from 'react'
import { setCursorType, unsetCursorType } from './cursor.js'
import { ManagerCollection, Properties } from './properties/utils.js'
import { WithClasses, useTraverseProperties } from './properties/default.js'
import { createConditionalPropertyTranslator } from './utils.js'

export type WithHover<T> = T & {
  cursor?: string
  hover?: T
  onHoverChange?: (hover: boolean) => void
}

export type HoverEventHandlers = Pick<EventHandlers, 'onPointerOver' | 'onPointerOut'>

export function useApplyHoverProperties(
  collection: ManagerCollection,
  properties: WithClasses<WithHover<Properties>> & EventHandlers,
): HoverEventHandlers | undefined {
  const hoveredSignal = useMemo(() => signal<Array<number>>([]), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const translate = useMemo(() => createConditionalPropertyTranslator(() => hoveredSignal.value.length > 0), [])
  let hoverPropertiesExist = false

  useTraverseProperties(properties, (p) => {
    if (p.hover == null) {
      return
    }
    hoverPropertiesExist = true
    translate(collection, p.hover)
  })

  //cleanup cursor effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => unsetCursorType(hoveredSignal), [])

  if (!hoverPropertiesExist && properties.onHoverChange == null && properties.cursor == null) {
    //no need to listen to hover
    hoveredSignal.value.length = 0
    return undefined
  }
  return {
    onPointerOver: (e) => {
      hoveredSignal.value = [e.pointerId, ...hoveredSignal.value]
      if (properties.onHoverChange != null && hoveredSignal.value.length === 1) {
        properties.onHoverChange(true)
      }
      if (properties.cursor != null) {
        setCursorType(hoveredSignal, properties.cursor)
      }
    },
    onPointerOut: (e) => {
      hoveredSignal.value = hoveredSignal.value.filter((id) => id != e.pointerId)
      if (properties.onHoverChange != null && hoveredSignal.value.length === 0) {
        properties.onHoverChange(false)
      }
      unsetCursorType(hoveredSignal)
    },
  }
}
