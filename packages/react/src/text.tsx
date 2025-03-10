import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { useParent } from './context.js'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import { FontFamilies, TextProperties as BaseTextProperties, createTextState, setupText } from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { Signal, signal } from '@preact/signals-core'
import { useFontFamilies } from './font.js'

export type TextProperties = {
  children: unknown | Array<unknown | Signal<unknown>> | Signal<unknown>
  name?: string
} & BaseTextProperties<R3FEventMap>

export type TextRef = ComponentInternals<Partial<BaseTextProperties<R3FEventMap>>>

export const Text: (props: TextProperties & RefAttributes<TextRef>) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const textSignal = useMemo(
    () => signal<unknown | Array<unknown | Signal<unknown>> | Signal<unknown>>(undefined as any),
    [],
  )
  textSignal.value = properties.children
  const fontFamilies = useMemo(() => signal<FontFamilies | undefined>(undefined as any), [])
  fontFamilies.value = useFontFamilies()
  const internals = useMemo(
    () =>
      createTextState<R3FEventMap>(
        parent,
        textSignal,
        fontFamilies,
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
      ),
    [fontFamilies, parent, propertySignals, textSignal],
  )

  internals.interactionPanel.name = properties.name ?? ''

  useEffect(() => {
    if (outerRef.current == null) {
      return
    }
    const abortController = new AbortController()
    setupText<R3FEventMap>(
      internals,
      parent,
      propertySignals.style,
      propertySignals.properties,
      outerRef.current,
      abortController.signal,
    )
    return () => abortController.abort()
  }, [parent, propertySignals, internals])

  useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
    </AddHandlers>
  )
})
