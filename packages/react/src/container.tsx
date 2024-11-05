import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import {
  ContainerProperties as BaseContainerProperties,
  createContainer,
  unsubscribeSubscriptions,
  Subscriptions,
  initialize,
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
        createContainer<R3FEventMap>(
          parent,
          propertySignals.style,
          propertySignals.properties,
          propertySignals.default,
          outerRef,
          innerRef,
        ),
      [parent, propertySignals],
    )

    internals.interactionPanel.name = properties.name ?? ''

    useEffect(() => {
      const subscriptions: Subscriptions = []
      initialize(internals.initializers, subscriptions)
      return () => unsubscribeSubscriptions(subscriptions)
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
