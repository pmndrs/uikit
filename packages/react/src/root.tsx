import { useFrame, useStore, useThree } from '@react-three/fiber'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, useEffect, useMemo, useRef } from 'react'
import { ParentProvider } from './context'
import { AddHandlers, AddScrollHandler } from './utilts'
import {
  MergedProperties,
  RootProperties,
  Subscriptions,
  createInteractionPanel,
  createListeners,
  patchRenderOrder,
  unsubscribeSubscriptions,
  updateListeners,
  createRoot,
  updateRootProperties,
  createRootPropertyTransformers,
  EventHandlers as CoreEventHandlers,
} from '@vanilla-three/uikit/internals'
import { signal } from '@preact/signals-core'
import { Object3D, Vector2Tuple } from 'three'
import { useDefaultProperties } from './default'

export const Root: (
  props: RootProperties & {
    children?: ReactNode
  } & EventHandlers,
) => ReactNode = forwardRef((properties, ref) => {
  const renderer = useThree((state) => state.gl)

  useEffect(() => patchRenderOrder(renderer), [renderer])

  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const defaultProperties = useDefaultProperties()
  const propertiesSignal = useMemo(() => signal<MergedProperties>(undefined as any), [])
  const rootSize = useMemo(() => signal<Vector2Tuple>([0, 0]), [])
  const hoveredSignal = useMemo(() => signal<Array<number>>([]), [])
  const activeSignal = useMemo(() => signal<Array<number>>([]), [])
  const tranformers = useMemo(
    () => createRootPropertyTransformers(rootSize, hoveredSignal, activeSignal),
    [rootSize, hoveredSignal, activeSignal],
  )
  const propertiesSubscriptions = useMemo<Subscriptions>(() => [], [])
  unsubscribeSubscriptions(propertiesSubscriptions)
  const handlers = updateRootProperties(
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
  const onFrameSet = useMemo(() => new Set<(delta: number) => void>(), [])
  const store = useStore()
  const ctx = useMemo(
    () =>
      createRoot(
        propertiesSignal,
        rootSize,
        outerRef,
        innerRef,
        scrollHandlers,
        listeners,
        properties.pixelSize,
        onFrameSet,
        () => store.getState().camera,
        subscriptions,
      ),
    [listeners, onFrameSet, properties.pixelSize, propertiesSignal, rootSize, scrollHandlers, store, subscriptions],
  )
  useEffect(
    () => () => {
      unsubscribeSubscriptions(propertiesSubscriptions)
      unsubscribeSubscriptions(subscriptions)
    },
    [propertiesSubscriptions, subscriptions],
  )

  useFrame((_, delta) => {
    for (const onFrame of onFrameSet) {
      onFrame(delta)
    }
  })

  //TBD: useComponentInternals(ref, node, interactionPanel, scrollPosition)

  const interactionPanel = useMemo(
    () =>
      createInteractionPanel(ctx.node.size, ctx.pixelSize, ctx.orderInfo, undefined, ctx.root.object, subscriptions),
    [ctx, subscriptions],
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
