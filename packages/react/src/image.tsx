import {
  createImage,
  ImageProperties as BaseImageProperties,
  initialize,
  Subscriptions,
  unsubscribeSubscriptions,
} from '@pmndrs/uikit/internals'
import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { AddHandlers, usePropertySignals } from './utilts.js'
import { ParentProvider, useParent } from './context.js'
import { ComponentInternals, useComponentInternals } from './ref.js'
import type { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'

export type ImageProperties = BaseImageProperties &
  EventHandlers & {
    children?: ReactNode
    name?: string
  }

export const Image: (props: ImageProperties & RefAttributes<ComponentInternals<ImageProperties>>) => ReactNode =
  forwardRef((properties, ref) => {
    const parent = useParent()
    const outerRef = useRef<Object3D>(null)
    const innerRef = useRef<Object3D>(null)
    const propertySignals = usePropertySignals(properties)
    const internals = useMemo(
      () =>
        createImage(
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

    useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

    useEffect(() => {
      if (internals.interactionPanel && properties.name) {
        internals.interactionPanel.name = properties.name
      }
    }, [internals.interactionPanel, properties.name])

    return (
      <AddHandlers userHandlers={properties} ref={outerRef} handlers={internals.handlers}>
        <primitive object={internals.interactionPanel} />
        <object3D matrixAutoUpdate={false} ref={innerRef}>
          <ParentProvider value={internals}>{properties.children}</ParentProvider>
        </object3D>
      </AddHandlers>
    )
  })
