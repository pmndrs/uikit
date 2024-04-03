import { Signal, effect, signal } from '@preact/signals-core'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { ReactNode, forwardRef, useEffect, useMemo, useState } from 'react'
import { Object3D } from 'three'
import { useDefaultProperties } from './default.js'
import { AllOptionalProperties } from '@vanilla-three/uikit/internals'

export const AddHandlers = forwardRef<Object3D, { handlers: Signal<EventHandlers>; children?: ReactNode }>(
  ({ handlers: handlersSignal, children }, ref) => {
    const [handlers, setHandlers] = useState(() => handlersSignal.value)
    useSignalEffect(() => setHandlers(handlersSignal.value), [handlersSignal])
    return (
      <object3D ref={ref} matrixAutoUpdate={false} {...handlers}>
        {children}
      </object3D>
    )
  },
)

export function useSignalEffect(fn: () => (() => void) | void, deps: Array<any>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unsubscribe = useMemo(() => effect(fn), deps)
  useEffect(() => unsubscribe, [unsubscribe])
}

export function usePropertySignals<T>(properties: T) {
  const propertySignals = useMemo(
    () => ({
      style: signal<T | undefined>(undefined),
      properties: signal<T>(undefined as any),
      default: signal<AllOptionalProperties | undefined>(undefined),
    }),
    [],
  )
  propertySignals.properties.value = properties
  propertySignals.default.value = useDefaultProperties()
  return propertySignals
}
