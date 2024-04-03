import { unsubscribeSubscriptions, IconProperties, createIcon } from '@vanilla-three/uikit/internals'
import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { AddHandlers, usePropertySignals } from './utilts.js'
import { useParent } from './context.js'
import { ComponentInternals, useComponentInternals } from './ref.js'
import type { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'

export const Icon: (
  props: IconProperties &
    EventHandlers &
    RefAttributes<ComponentInternals> & { text: string; svgWidth: number; svgHeight: number; children?: ReactNode },
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const internals = useMemo(
    () =>
      createIcon(
        parent,
        properties.text,
        properties.svgWidth,
        properties.svgHeight,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
      ),
    [parent, properties.svgHeight, properties.svgWidth, properties.text, propertySignals],
  )
  useEffect(() => () => unsubscribeSubscriptions(internals.subscriptions), [internals])

  useComponentInternals(ref, propertySignals.style, internals)

  return (
    <AddHandlers ref={outerRef} handlers={internals.handlers}>
      <primitive object={internals.interactionPanel} />
      <primitive object={internals.iconGroup} />
    </AddHandlers>
  )
})
