import { useFrame, useStore, useThree } from '@react-three/fiber'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { ParentProvider } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import {
  RootProperties,
  Subscriptions,
  createRoot,
  initialize,
  reversePainterSortStable,
  unsubscribeSubscriptions,
} from '@pmndrs/uikit/internals'
import { Object3D } from 'three'
import { ComponentInternals, useComponentInternals } from './ref.js'

export const Root: (
  props: RootProperties & {
    children?: ReactNode
  } & EventHandlers &
    RefAttributes<ComponentInternals<RootProperties>>,
) => ReactNode = forwardRef((properties, ref) => {
  const renderer = useThree((state) => state.gl)
  renderer.setTransparentSort(reversePainterSortStable)
  const store = useStore()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const onFrameSet = useMemo(() => new Set<(delta: number) => void>(), [])
  const internals = useMemo(
    () =>
      createRoot(
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
        innerRef,
        () => store.getState().camera,
        renderer,
        onFrameSet,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  useEffect(() => {
    const subscriptions: Subscriptions = []
    initialize(internals.initializers, subscriptions)
    return () => unsubscribeSubscriptions(subscriptions)
  }, [internals])

  useFrame((_, delta) => {
    for (const onFrame of onFrameSet) {
      onFrame(delta)
    }
  })

  useComponentInternals(ref, internals.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers userHandlers={properties} handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
      <object3D ref={innerRef}>
        <ParentProvider value={internals}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
