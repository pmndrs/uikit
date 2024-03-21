import { Signal, effect } from '@preact/signals-core'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { ReactNode, forwardRef, useEffect, useMemo, useState } from 'react'
import { Object3D } from 'three'

export const AddHandlers = forwardRef<Object3D, { handlers: EventHandlers; children?: ReactNode }>(
  ({ handlers, children }, ref) => {
    return (
      <object3D ref={ref} matrixAutoUpdate={false} {...handlers}>
        {children}
      </object3D>
    )
  },
)

export function AddScrollHandler({
  handlers,
  children,
}: {
  handlers: Signal<EventHandlers | undefined>
  children?: ReactNode
}) {
  const [scrollHandlers, setScrollHandlers] = useState(() => handlers.value)
  useSignalEffect(() => setScrollHandlers(handlers.value), [handlers])
  return (
    <object3D matrixAutoUpdate={false} {...scrollHandlers}>
      {children}
    </object3D>
  )
}

export function useSignalEffect(fn: () => (() => void) | void, deps: Array<any>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unsubscribe = useMemo(() => effect(fn), deps)
  useEffect(() => unsubscribe, [unsubscribe])
}
