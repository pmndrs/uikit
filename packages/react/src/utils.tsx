import { Signal, effect, signal } from '@preact/signals-core'
import { EventHandlers, ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events'
import { ReactNode, forwardRef, useEffect, useMemo, useState } from 'react'
import { Object3D } from 'three'
import { useDefaultProperties } from './default.js'
import { AllOptionalProperties } from '@pmndrs/uikit/internals'

export type R3FEventMap = {
  mouse: ThreeEvent<MouseEvent>
  wheel: ThreeEvent<WheelEvent>
  pointer: ThreeEvent<PointerEvent>
}

export const AddHandlers = forwardRef<
  Object3D,
  {
    handlers: Signal<EventHandlers>
    children?: ReactNode
  }
>(({ handlers: handlersSignal, children }, ref) => {
  const [handlers, setHandlers] = useState(() => handlersSignal.peek())
  useEffect(
    () =>
      effect(() => {
        const handlers = handlersSignal.value
        const ref = void setTimeout(() => setHandlers(handlers), 0)
        return () => clearTimeout(ref)
      }),
    [handlersSignal],
  )
  return (
    <object3D ref={ref} matrixAutoUpdate={false} {...handlers}>
      {children}
    </object3D>
  )
})

export function usePropertySignals<T>(properties: T) {
  const propertySignals = useMemo(
    () => ({
      style: signal<T | undefined>(undefined),
      properties: signal<T | undefined>(undefined as any),
      default: signal<AllOptionalProperties | undefined>(undefined),
    }),
    [],
  )
  propertySignals.properties.value = properties
  propertySignals.default.value = useDefaultProperties()
  return propertySignals
}
