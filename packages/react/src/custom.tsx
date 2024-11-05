import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Material, Mesh, Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import {
  createCustomContainer,
  CustomContainerProperties as BaseCustomContainerProperties,
  initialize,
  panelGeometry,
  Subscriptions,
  unsubscribeSubscriptions,
} from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'

export type CustomContainerProperties = {
  name?: string
  children?: ReactNode
  customDepthMaterial?: Material
  customDistanceMaterial?: Material
} & BaseCustomContainerProperties<R3FEventMap>

export type CustomContainerRef = ComponentInternals<BaseCustomContainerProperties<R3FEventMap>>

export const CustomContainer: (props: CustomContainerProperties & RefAttributes<CustomContainerRef>) => ReactNode =
  forwardRef((properties, ref) => {
    const parent = useParent()
    const outerRef = useRef<Object3D>(null)
    const innerRef = useRef<Mesh>(null)
    const propertySignals = usePropertySignals(properties)
    const internals = useMemo(
      () =>
        createCustomContainer<R3FEventMap>(
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
    }, [internals])

    useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, innerRef)

    useEffect(() => {
      if (innerRef.current && properties.name) {
        innerRef.current.name = properties.name
      }
    }, [properties.name])

    return (
      <AddHandlers handlers={internals.handlers} ref={outerRef}>
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
