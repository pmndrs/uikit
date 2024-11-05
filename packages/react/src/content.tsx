import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import { createContent, initialize, Subscriptions, unsubscribeSubscriptions } from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { ContentProperties as BaseContentProperties } from '../../uikit/dist/components/content.js'

export type ContentProperties = {
  name?: string
  children?: ReactNode
} & BaseContentProperties<R3FEventMap>

export type ContentRef = ComponentInternals<BaseContentProperties<R3FEventMap>>

export const Content: (props: ContentProperties & RefAttributes<ContentRef>) => ReactNode = forwardRef(
  (properties, ref) => {
    const parent = useParent()
    const outerRef = useRef<Object3D>(null)
    const innerRef = useRef<Object3D>(null)
    const propertySignals = usePropertySignals(properties)
    const internals = useMemo(
      () =>
        createContent<R3FEventMap>(
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
    }, [internals])

    useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

    return (
      <AddHandlers handlers={internals.handlers} ref={outerRef}>
        <primitive object={internals.interactionPanel} />
        <object3D matrixAutoUpdate={false} ref={innerRef}>
          <ParentProvider value={undefined}>{properties.children}</ParentProvider>
        </object3D>
      </AddHandlers>
    )
  },
)
