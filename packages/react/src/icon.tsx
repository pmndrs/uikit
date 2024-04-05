import { unsubscribeSubscriptions, IconProperties, createIcon } from '@pmndrs/uikit/internals'
import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { AddHandlers, usePropertySignals } from './utilts.js'
import { useParent } from './context.js'
import { ComponentInternals, useComponentInternals } from './ref.js'
import type { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'

export const Icon: (
  props: IconProperties &
    EventHandlers &
    RefAttributes<ComponentInternals<IconProperties>> & {
      text: string
      svgWidth: number
      svgHeight: number
      children?: ReactNode
    },
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
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
      ),
    [parent, properties.svgHeight, properties.svgWidth, properties.text, propertySignals],
  )
  useEffect(() => () => unsubscribeSubscriptions(internals.subscriptions), [internals])

  useComponentInternals(ref, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers userHandlers={properties} ref={outerRef} handlers={internals.handlers}>
      <primitive object={internals.interactionPanel} />
      <primitive object={internals.iconGroup} />
    </AddHandlers>
  )
})
