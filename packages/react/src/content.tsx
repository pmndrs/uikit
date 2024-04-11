import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import { createContent, initialize, Subscriptions, unsubscribeSubscriptions } from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { ContentProperties } from '../../uikit/dist/components/content.js'

export const Content: (
  props: {
    children?: ReactNode
  } & ContentProperties &
    EventHandlers &
    RefAttributes<ComponentInternals<ContentProperties>>,
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const internals = useMemo(
    () =>
      createContent(
        parent,
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
        innerRef,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  useEffect(() => {
    const subscriptions: Subscriptions = []
    initialize(internals.initializers, subscriptions)
    return () => unsubscribeSubscriptions(subscriptions)
  }, [internals])

  useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers userHandlers={properties} handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
      <object3D matrixAutoUpdate={false} ref={innerRef}>
        <ParentProvider value={undefined}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
