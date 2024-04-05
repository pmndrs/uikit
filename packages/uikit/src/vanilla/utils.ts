import { Signal, effect } from '@preact/signals-core'
import { Subscriptions } from '../utils.js'
import { EventHandlers } from '../events.js'
import { Object3D, Object3DEventMap } from 'three'

export function bindHandlers(
  handlers: Signal<EventHandlers>,
  container: Object3D<EventMap>,
  subscriptions: Subscriptions,
) {
  subscriptions.push(
    effect(() => {
      const { value } = handlers
      for (const key in value) {
        container.addEventListener(keyToEventName(key as keyof EventHandlers), value[key as keyof EventHandlers] as any)
      }
      return () => {
        for (const key in value) {
          container.removeEventListener(
            keyToEventName(key as keyof EventHandlers),
            value[key as keyof EventHandlers] as any,
          )
        }
      }
    }),
  )
}

function keyToEventName(key: keyof EventHandlers) {
  return (key[2].toLowerCase() + key.slice(3)) as keyof EventMap
}

export type EventMap = Object3DEventMap & {
  [Key in keyof EventHandlers as RemoveOn<Key>]: EventHandlers[Key]
}

type RemoveOn<T> = Uncapitalize<T extends `on${infer K}` ? K : never>
