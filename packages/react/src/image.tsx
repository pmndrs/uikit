import { createImage, ImageProperties, unsubscribeSubscriptions } from '@pmndrs/uikit/internals'
import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D, Texture } from 'three'
import { AddHandlers, usePropertySignals } from './utilts.js'
import { ParentProvider, useParent } from './context.js'
import { ComponentInternals, useComponentInternals } from './ref.js'
import type { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { Signal, signal } from '@preact/signals-core'

export const Image: (
  props: ImageProperties &
    EventHandlers &
    RefAttributes<ComponentInternals<ImageProperties>> & {
      src?: Signal<string | undefined> | string | Texture | Signal<Texture | undefined>
      children?: ReactNode
    },
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const srcSignal = useMemo(
    () => signal<Signal<string | undefined> | string | Texture | Signal<Texture | undefined> | undefined>(undefined),
    [],
  )
  srcSignal.value = properties.src
  const internals = useMemo(
    () =>
      createImage(
        parent,
        srcSignal,
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
        innerRef,
      ),
    [parent, propertySignals, srcSignal],
  )
  useEffect(() => () => unsubscribeSubscriptions(internals.subscriptions), [internals])

  useComponentInternals(ref, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers userHandlers={properties} ref={outerRef} handlers={internals.handlers}>
      <primitive object={internals.interactionPanel} />
      <object3D ref={innerRef}>
        <ParentProvider value={internals}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
