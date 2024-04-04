import { Signal, effect, signal } from '@preact/signals-core'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { ReactNode, forwardRef, useEffect, useMemo, useState } from 'react'
import { Object3D } from 'three'
import { useDefaultProperties } from './default.js'
import { AllOptionalProperties, addHandler } from '@vanilla-three/uikit/internals'

const eventHandlerKeys: Array<keyof EventHandlers> = [
  'onClick',
  'onContextMenu',
  'onDoubleClick',
  'onPointerCancel',
  'onPointerDown',
  'onPointerEnter',
  'onPointerLeave',
  'onPointerMissed',
  'onPointerMove',
  'onPointerOut',
  'onPointerOver',
  'onPointerUp',
  'onWheel',
]

export const AddHandlers = forwardRef<
  Object3D,
  { userHandlers: EventHandlers; handlers: Signal<EventHandlers>; children?: ReactNode }
>(({ handlers: handlersSignal, userHandlers, children }, ref) => {
  const [systemHandlers, setSystemHandlers] = useState(() => handlersSignal.value)
  useSignalEffect(() => {
    const handlers = handlersSignal.value
    const ref = void setTimeout(() => setSystemHandlers(handlers), 0)
    return () => clearTimeout(ref)
  }, [handlersSignal])
  const handlers = useMemo(() => {
    const result: EventHandlers = { ...systemHandlers }
    const keysLength = eventHandlerKeys.length
    for (let i = 0; i < keysLength; i++) {
      const key = eventHandlerKeys[i]
      addHandler(key, result, userHandlers[key])
    }
    return result
  }, [systemHandlers, userHandlers])
  return (
    <object3D ref={ref} matrixAutoUpdate={false} {...handlers}>
      {children}
    </object3D>
  )
})

function useSignalEffect(fn: () => (() => void) | void, deps: Array<any>) {
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
