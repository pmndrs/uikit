import { Signal, effect } from '@preact/signals-core'
import { Subscriptions } from '../utils.js'
import { EventHandlers } from '../events.js'
import { Object3D } from 'three'

export type EventConfig = {
  bindEventHandlers: (object: Object3D, handlers: EventHandlers) => void
  unbindEventHandlers: (object: Object3D, handlers: EventHandlers) => void
}

export function bindHandlers(
  handlers: Signal<EventHandlers>,
  container: Object3D,
  eventConfig: EventConfig,
  subscriptions: Subscriptions,
) {
  subscriptions.push(
    effect(() => {
      const { value } = handlers
      eventConfig.bindEventHandlers(container, value)
      return () => eventConfig.unbindEventHandlers(container, value)
    }),
  )
}
