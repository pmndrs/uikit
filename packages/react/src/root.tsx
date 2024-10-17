import { useFrame, useStore, useThree } from '@react-three/fiber'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { ParentProvider } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import {
  DEFAULT_PIXEL_SIZE,
  RootProperties as BaseRootProperties,
  Subscriptions,
  WithReactive,
  createRoot,
  initialize,
  readReactive,
  reversePainterSortStable,
  unsubscribeSubscriptions,
  PointerEventsProperties,
} from '@pmndrs/uikit/internals'
import { Object3D } from 'three'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { Signal, computed, signal } from '@preact/signals-core'

export type RootProperties = BaseRootProperties &
  WithReactive<{ pixelSize?: number }> & {
    children?: ReactNode
    name?: string
  } & EventHandlers &
  PointerEventsProperties

export const Root: (
  props: RootProperties & RefAttributes<ComponentInternals<BaseRootProperties & EventHandlers>>,
) => ReactNode = forwardRef((properties, ref) => {
  const renderer = useThree((state) => state.gl)
  renderer.setTransparentSort(reversePainterSortStable)
  const store = useStore()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const pixelSizeSignal = useMemo(() => signal<Signal<number | undefined> | number | undefined>(undefined), [])
  pixelSizeSignal.value = properties.pixelSize
  const propertySignals = usePropertySignals(properties)
  const onFrameSet = useMemo(() => new Set<(delta: number) => void>(), [])
  const whileOnFrameRef = useRef(false)
  const invalidate = useThree((s) => s.invalidate)
  const internals = useMemo(
    () =>
      createRoot(
        computed(() => readReactive(pixelSizeSignal.value) ?? DEFAULT_PIXEL_SIZE),
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
        innerRef,
        () => store.getState().camera,
        renderer,
        onFrameSet,
        () => {
          if (whileOnFrameRef.current) {
            //request render unnecassary -> already rendering
            return
          }
          //not rendering -> requesting a new frame
          invalidate()
        },
        //requestFrame = invalidate, because invalidate always causes another frame
        invalidate,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [invalidate],
  )

  internals.interactionPanel.name = properties.name ?? ''

  useEffect(() => {
    const subscriptions: Subscriptions = []
    initialize(internals.initializers, subscriptions)
    return () => unsubscribeSubscriptions(subscriptions)
  }, [internals])

  useFrame((_, delta) => {
    whileOnFrameRef.current = true
    for (const onFrame of onFrameSet) {
      //delta must be provided in milliseconds, therefore multiply by 1000
      onFrame(delta * 1000)
    }
    whileOnFrameRef.current = false
  })

  useComponentInternals(ref, internals.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers properties={{ pointerEvents: 'auto', ...properties }} handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
      <object3D matrixAutoUpdate={false} ref={innerRef}>
        <ParentProvider value={internals}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
