import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { useParent } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import {
  FontFamilies,
  InputProperties,
  Subscriptions,
  createInput,
  initialize,
  readReactive,
  unsubscribeSubscriptions,
} from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { computed, effect, ReadonlySignal, Signal, signal } from '@preact/signals-core'
import { useFontFamilies } from './font.js'

export type InputInternals = ComponentInternals<InputProperties> & {
  current: ReadonlySignal<string>
  focus: () => void
}

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
          propertySignals.style.peek()?.onValueChange?.(newValue)
          propertySignals.properties.peek()?.onValueChange?.(newValue)
        },
        properties.multiline ?? false,
        fontFamilies,
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    const subscriptions: Subscriptions = []
    initialize(internals.initializers, subscriptions)
    return () => unsubscribeSubscriptions(subscriptions)
  }, [internals])

  useEffect(
    () =>
      effect(() => {
        if (internals.element.value == null) {
          return
        }
        internals.element.value.tabIndex = properties.tabIndex ?? 0
      }),
    [internals, properties.tabIndex],
  )

  useComponentInternals(
    ref,
    parent.root.pixelSize,
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
