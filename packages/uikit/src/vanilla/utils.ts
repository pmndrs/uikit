import { Signal, effect } from '@preact/signals-core'
import { Subscriptions } from '../utils'
import { EventHandlers } from '../events'
import { Mesh, Object3D } from 'three'
import { RootContext } from '../context'

export type EventConfig = {
  bindEventHandlers: (object: Object3D, handlers: EventHandlers) => void
  unbindEventHandlers: (object: Object3D, handlers: EventHandlers) => void
}

export function bindHandlers(
  {
    scrollHandlers,
    handlers,
    subscriptions,
  }: {
    scrollHandlers: Signal<EventHandlers>
    handlers: Signal<EventHandlers>
    subscriptions: Subscriptions
  },
  container: Object3D,
  mesh: Mesh,
  eventConfig: EventConfig,
) {
  subscriptions.push(
    effect(() => {
      const { value } = handlers
      eventConfig.bindEventHandlers(container, value)
      return () => eventConfig.unbindEventHandlers(container, value)
    }),
    effect(() => {
      const { value } = scrollHandlers
      eventConfig.bindEventHandlers(mesh, value)
      return () => eventConfig.unbindEventHandlers(mesh, value)
    }),
  )
}
