import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, usePropertySignals } from './utilts.js'
import {
  ContainerProperties,
  createContainer,
  createText,
  destroyContainer,
  FontFamilies,
} from '@vanilla-three/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { Signal, signal } from '@preact/signals-core'
import { useFontFamilies } from './font.js'

export const Text: (
  props: {
    children: string | Array<string | Signal<string>> | Signal<string>
  } & ContainerProperties &
    EventHandlers &
    RefAttributes<ComponentInternals>,
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const textSignal = useMemo(
    () => signal<string | Array<string | Signal<string>> | Signal<string>>(undefined as any),
    [],
  )
  textSignal.value = properties.children
  const fontFamilies = useMemo(() => signal<FontFamilies | undefined>(undefined as any), [])
  fontFamilies.value = useFontFamilies()
  const internals = useMemo(
    () =>
      createText(
        parent,
        textSignal,
        fontFamilies,
        propertySignals.properties,
        propertySignals.default,
        outerRef,
        innerRef,
      ),
    [fontFamilies, parent, propertySignals, textSignal],
  )
  useEffect(() => () => destroyContainer(internals), [internals])

  useComponentInternals(ref, propertySignals.style, internals)

  return (
    <AddHandlers handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
    </AddHandlers>
  )
})
