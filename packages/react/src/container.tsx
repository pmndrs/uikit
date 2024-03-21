import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context'
import { AddHandlers, AddScrollHandler } from './utilts'
import {
  createContainer,
  createInteractionPanel,
  createListeners,
  MergedProperties,
  Subscriptions,
  unsubscribeSubscriptions,
  updateListeners,
  EventHandlers as CoreEventHandlers,
  updateContainerProperties,
  createContainerPropertyTransfomers,
  ContainerProperties,
} from '@vanilla-three/uikit/internals'
import { signal } from '@preact/signals-core'
import { useDefaultProperties } from './default'

export const Container: (
  props: {
    children?: ReactNode
  } & ContainerProperties &
    EventHandlers,
) => ReactNode = forwardRef((properties, ref) => {
  //TODO: ComponentInternals
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const parent = useParent()
  const defaultProperties = useDefaultProperties()
  const propertiesSignal = useMemo(() => signal<MergedProperties>(undefined as any), [])
  const hoveredSignal = useMemo(() => signal<Array<number>>([]), [])
  const activeSignal = useMemo(() => signal<Array<number>>([]), [])
  const tranformers = useMemo(
    () => createContainerPropertyTransfomers(parent.root.node.size, hoveredSignal, activeSignal),
    [parent, hoveredSignal, activeSignal],
  )
  const propertiesSubscriptions = useMemo<Subscriptions>(() => [], [])
  unsubscribeSubscriptions(propertiesSubscriptions)
  const handlers = updateContainerProperties(
    propertiesSignal,
    properties,
    defaultProperties,
    hoveredSignal,
    activeSignal,
    tranformers,
    propertiesSubscriptions,
  )

  const listeners = useMemo(() => createListeners(), [])
  updateListeners(listeners, properties)

  const scrollHandlers = useMemo(() => signal<CoreEventHandlers>({}), [])

  const subscriptions = useMemo<Subscriptions>(() => [], [])
  const ctx = useMemo(
    () => createContainer(propertiesSignal, outerRef, innerRef, parent, scrollHandlers, listeners, subscriptions),
    [listeners, parent, propertiesSignal, scrollHandlers, subscriptions],
  )
  useEffect(
    () => () => {
      unsubscribeSubscriptions(propertiesSubscriptions)
      unsubscribeSubscriptions(subscriptions)
    },
    [propertiesSubscriptions, subscriptions],
  )

  //TBD: useComponentInternals(ref, node, interactionPanel, scrollPosition)

  const interactionPanel = useMemo(
    () =>
      createInteractionPanel(
        ctx.node.size,
        parent.root.pixelSize,
        ctx.orderInfo,
        parent.clippingRect,
        ctx.root.object,
        subscriptions,
      ),
    [ctx, parent, subscriptions],
  )

  return (
    <AddHandlers handlers={handlers} ref={outerRef}>
      <AddScrollHandler handlers={scrollHandlers}>
        <primitive object={interactionPanel} />
      </AddScrollHandler>
      <object3D ref={innerRef}>
        <ParentProvider value={ctx}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
