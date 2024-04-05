import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { useParent } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import {
  FontFamilies,
  unsubscribeSubscriptions,
  InputProperties,
  createInput,
  readReactive,
} from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { computed, ReadonlySignal, Signal, signal } from '@preact/signals-core'
import { useFontFamilies } from './font.js'

export type InputInternals = ComponentInternals & { current: ReadonlySignal<string>; focus: () => void }

export const Input: (
  props: {
    multiline?: boolean
    value?: string | Signal<string>
    defaultValue?: string
    tabIndex?: number
  } & InputProperties &
    EventHandlers &
    RefAttributes<InputInternals>,
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const valueSignal = useMemo(() => signal<Signal<string> | string>(''), [])
  const controlled = useRef(properties.value != null)
  valueSignal.value = (controlled.current ? properties.value : properties.defaultValue) ?? ''
  const current = useMemo(() => computed(() => readReactive(valueSignal.value)), [valueSignal])
  const fontFamilies = useMemo(() => signal<FontFamilies | undefined>(undefined as any), [])
  fontFamilies.value = useFontFamilies()
  //allows to not get a eslint error because of dependencies (we deliberatly never update this ref)
  const internals = useMemo(
    () =>
      createInput(
        parent,
        current,
        (newValue) => {
          if (!controlled.current) {
            valueSignal.value = newValue
          }
          propertySignals.properties.peek().onValueChange?.(newValue)
        },
        properties.multiline ?? false,
        fontFamilies,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
      ),
    [parent, current, properties.multiline, fontFamilies, propertySignals, valueSignal],
  )
  internals.element.tabIndex = properties.tabIndex ?? 0
  useEffect(() => () => unsubscribeSubscriptions(internals.subscriptions), [internals])

  useComponentInternals(
    ref,
    propertySignals.style,
    internals,
    internals.interactionPanel,
    useMemo(() => ({ focus: internals.focus, current }), [internals.focus, current]),
  )

  return (
    <AddHandlers userHandlers={properties} handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
    </AddHandlers>
  )
})
