import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D, Vector2Tuple } from 'three'
import { useParent } from './context.js'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import {
  FontFamilies,
  InputProperties as BaseInputProperties,
  Subscriptions,
  createInput,
  initialize,
  unsubscribeSubscriptions,
  CaretTransformation,
  SelectionTransformation,
} from '@pmndrs/uikit/internals'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { ReadonlySignal, signal } from '@preact/signals-core'
import { useFontFamilies } from './font.js'

export type InputRef = InputInternals

export type InputInternals = ComponentInternals<BaseInputProperties<R3FEventMap>> & {
  current: ReadonlySignal<string>
  focus: () => void
  blur: () => void
  element: ReadonlySignal<HTMLInputElement | HTMLTextAreaElement | undefined>
  selectionRange: ReadonlySignal<Vector2Tuple | undefined>
  caretTransformation: ReadonlySignal<CaretTransformation | undefined>
  selectionTransformations: ReadonlySignal<Array<SelectionTransformation>>
}

export type InputProperties = BaseInputProperties<R3FEventMap> & {
  name?: string
}

export const Input: (props: InputProperties & RefAttributes<InputRef>) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const fontFamilies = useMemo(() => signal<FontFamilies | undefined>(undefined as any), [])
  fontFamilies.value = useFontFamilies()
  //allows to not get a eslint error because of dependencies (we deliberatly never update this ref)
  const internals = useMemo(
    () =>
      createInput<R3FEventMap>(
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
      () => ({
        focus: internals.focus,
        blur: internals.blur,
        current: internals.valueSignal,
        element: internals.element,
        selectionRange: internals.selectionRange,
        caretTransformation: internals.caretTransformation,
        selectionTransformations: internals.selectionTransformations,
      }),
      [
        internals.focus,
        internals.blur,
        internals.valueSignal,
        internals.element,
        internals.caretTransformation,
        internals.selectionRange,
        internals.selectionTransformations,
      ],
    ),
  )

  return (
    <AddHandlers handlers={internals.handlers} ref={outerRef}>
      <primitive object={internals.interactionPanel} />
    </AddHandlers>
  )
})
