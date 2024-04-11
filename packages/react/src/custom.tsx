import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Material, Mesh, Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import {
  createCustomContainer,
  CustomContainerProperties,
  initialize,
  panelGeometry,
  Subscriptions,
  unsubscribeSubscriptions,
} from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'

export const CustomContainer: (
  props: {
    children?: ReactNode
    customDepthMaterial?: Material
    customDistanceMaterial?: Material
  } & CustomContainerProperties &
    EventHandlers &
    RefAttributes<ComponentInternals<CustomContainerProperties>>,
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Mesh>(null)
  const propertySignals = usePropertySignals(properties)
  const internals = useMemo(
    () =>
      createCustomContainer(
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

  useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, innerRef)

  return (
    <AddHandlers userHandlers={properties} handlers={internals.handlers} ref={outerRef}>
      <ParentProvider value={undefined}>
        <mesh
          ref={innerRef}
          matrixAutoUpdate={false}
          geometry={panelGeometry}
          customDepthMaterial={properties.customDepthMaterial}
          customDistanceMaterial={properties.customDistanceMaterial}
        >
          {properties.children}
        </mesh>
      </ParentProvider>
    </AddHandlers>
  )
})
