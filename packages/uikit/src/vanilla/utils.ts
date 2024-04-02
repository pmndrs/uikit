import { Signal, effect } from '@preact/signals-core'
import { Subscriptions } from '../utils.js'
import { EventHandlers } from '../events.js'
import { Mesh, Object3D } from 'three'

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
