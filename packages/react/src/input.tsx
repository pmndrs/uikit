import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { useParent } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import {
  FontFamilies,
  InputProperties as BaseInputProperties,
  Subscriptions,
  createInput,
  initialize,
  unsubscribeSubscriptions,
  PointerEventsProperties,
} from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { ReadonlySignal, signal } from '@preact/signals-core'
import { useFontFamilies } from './font.js'

export type InputInternals = ComponentInternals<BaseInputProperties & EventHandlers> & {
  current: ReadonlySignal<string>
  focus: () => void
} & PointerEventsProperties

export type InputProperties = BaseInputProperties &
  EventHandlers & {
    name?: string
  }

export const Input: (props: InputProperties & RefAttributes<InputInternals>) => ReactNode = forwardRef(
  (properties, ref) => {
    const parent = useParent()
    const outerRef = useRef<Object3D>(null)
    const propertySignals = usePropertySignals(properties)
    const fontFamilies = useMemo(() => signal<FontFamilies | undefined>(undefined as any), [])
    fontFamilies.value = useFontFamilies()
    //allows to not get a eslint error because of dependencies (we deliberatly never update this ref)
    const internals = useMemo(
      () =>
        createInput(
          parent,
          fontFamilies,
          propertySignals.style,
          propertySignals.properties,
          propertySignals.default,
          outerRef,
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    )

    internals.interactionPanel.name = properties.name ?? ''

    useEffect(() => {
      const subscriptions: Subscriptions = []
      initialize(internals.initializers, subscriptions)
      return () => unsubscribeSubscriptions(subscriptions)
    }, [internals])

    useComponentInternals(
      ref,
      parent.root.pixelSize,
      propertySignals.style,
      internals,
      internals.interactionPanel,
      useMemo(
        () => ({ focus: internals.focus, current: internals.valueSignal }),
        [internals.focus, internals.valueSignal],
      ),
    )

    return (
      <AddHandlers allowSkippingChildren properties={properties} handlers={internals.handlers} ref={outerRef}>
        <primitive object={internals.interactionPanel} />
      </AddHandlers>
    )
  },
)
