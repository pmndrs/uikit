import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Material, Mesh, Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import {
  CustomContainerProperties as BaseCustomContainerProperties,
  createCustomContainerState,
  panelGeometry,
  setupCustomContainer,
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
        createCustomContainerState<R3FEventMap>(
          parent,
          propertySignals.style,
          propertySignals.properties,
          propertySignals.default,
        ),
      [parent, propertySignals],
    )
    useEffect(() => {
      if (outerRef.current == null || innerRef.current == null) {
        return
      }
      const abortController = new AbortController()
      setupCustomContainer<R3FEventMap>(
        internals,
        parent,
        propertySignals.style,
        propertySignals.properties,
        outerRef.current,
        innerRef.current,
        abortController.signal,
      )
      return () => abortController.abort()
    }, [internals, parent, propertySignals])

    useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, innerRef)

    useEffect(() => {
      if (innerRef.current == null) {
        return
      }
      innerRef.current.name = properties.name ?? ''
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
