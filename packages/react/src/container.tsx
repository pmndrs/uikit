import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import {
  ContainerProperties as BaseContainerProperties,
  createContainerState,
  setupContainer,
} from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { DefaultProperties } from './default.js'

export type ContainerProperties = {
  name?: string
  children?: ReactNode
} & BaseContainerProperties<R3FEventMap>

export type ContainerRef = ComponentInternals<BaseContainerProperties<R3FEventMap>>

export const Container: (props: ContainerProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  (properties, ref) => {
    const parent = useParent()
    const outerRef = useRef<Object3D>(null)
    const innerRef = useRef<Object3D>(null)
    const propertySignals = usePropertySignals(properties)

    const internals = useMemo(
      () =>
        createContainerState<R3FEventMap>(
          parent,
          outerRef,
          propertySignals.style,
          propertySignals.properties,
          propertySignals.default,
        ),
      [parent, propertySignals],
    )

    internals.interactionPanel.name = properties.name ?? ''

    useEffect(() => {
      if (outerRef.current == null || innerRef.current == null) {
        return
      }
      const abortController = new AbortController()
      setupContainer<R3FEventMap>(
        internals,
        parent,
        propertySignals.style,
        propertySignals.properties,
        outerRef.current,
        innerRef.current,
        abortController.signal,
      )
      return () => abortController.abort()
    }, [parent, propertySignals, internals])

    useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

    return (
      <AddHandlers handlers={internals.handlers} ref={outerRef}>
        <primitive object={internals.interactionPanel} />
        <object3D matrixAutoUpdate={false} ref={innerRef}>
          <DefaultProperties {...internals.defaultProperties}>
            <ParentProvider value={internals}>{properties.children}</ParentProvider>
          </DefaultProperties>
        </object3D>
      </AddHandlers>
    )
  },
)
