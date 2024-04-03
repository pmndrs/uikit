import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { useParent } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import { FontFamilies, unsubscribeSubscriptions, InputProperties, createInput } from '@vanilla-three/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { Signal, signal } from '@preact/signals-core'
import { useFontFamilies } from './font.js'

export const Input: (
  props: {
    children: string | Array<string | Signal<string>> | Signal<string>
    multiline?: boolean
    value?: string | Signal<string>
    defaultValue?: string
  } & InputProperties &
    EventHandlers &
    RefAttributes<ComponentInternals>,
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const valueSignal = useMemo(() => signal<Signal<string> | string>(''), [])
  valueSignal.value = properties.value ?? ''
  const fontFamilies = useMemo(() => signal<FontFamilies | undefined>(undefined as any), [])
  fontFamilies.value = useFontFamilies()
  //allows to not get a eslint error because of dependencies (we deliberatly never update this ref)
  const defaultValue = useRef(properties.defaultValue)
  const internals = useMemo(
    () =>
      createInput(
        parent,
        defaultValue.current == null ? valueSignal : defaultValue.current,
        properties.multiline ?? false,
        fontFamilies,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
      ),
    [parent, valueSignal, properties.multiline, fontFamilies, propertySignals],
  )
  useEffect(() => () => unsubscribeSubscriptions(internals.subscriptions), [internals])

  useComponentInternals(ref, propertySignals.style, internals)

  return (
    <AddHandlers handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
    </AddHandlers>
  )
})
