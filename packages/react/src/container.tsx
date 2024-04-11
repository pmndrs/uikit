import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import {
  ContainerProperties,
  createContainer,
  unsubscribeSubscriptions,
  Subscriptions,
  initialize,
} from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'

export const Container: (
  props: {
    children?: ReactNode
  } & ContainerProperties &
    EventHandlers &
    RefAttributes<ComponentInternals<ContainerProperties>>,
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const internals = useMemo(
    () =>
      createContainer(
        parent,
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
        innerRef,
      ),
    [parent, propertySignals],
  )
  useEffect(() => {
    const subscriptions: Subscriptions = []
    initialize(internals.initializers, subscriptions)
    return () => unsubscribeSubscriptions(subscriptions)
  }, [parent, propertySignals, internals])

  useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers userHandlers={properties} handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
      <object3D ref={innerRef}>
        <ParentProvider value={internals}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
