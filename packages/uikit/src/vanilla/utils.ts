import { Signal, signal, effect } from '@preact/signals-core'
import { Subscriptions } from '../utils.js'
import { EventHandlers } from '../events.js'
import { Object3D, Object3DEventMap } from 'three'
import { ParentContext } from '../context.js'
import { FontFamilies } from '../internals.js'

const _addedEvent = { type: 'added' as const }
const _childaddedEvent = { type: 'childadded' as const, child: null as null | Object3D }

export function createParentContextSignal() {
  return signal<
    | Signal<
        | (ParentContext & {
            fontFamiliesSignal: Signal<FontFamilies | undefined>
          })
        | undefined
      >
    | undefined
  >(undefined)
}

export function setupParentContextSignal(
  parentContextSignal: ReturnType<typeof createParentContextSignal>,
  container: Object3D,
) {
  container.addEventListener('added', () => {
    if (!(container.parent?.parent instanceof Parent)) {
      throw new Error(`uikit objects can only be added to uikit parent elements (e.g. Container, Root, ...)`)
    }
    parentContextSignal.value = container.parent.parent.contextSignal
  })
  container.addEventListener('removed', () => (parentContextSignal.value = undefined))
}

export class Parent extends Object3D<EventMap> {
  readonly contextSignal: Signal<
    | (ParentContext & {
        fontFamiliesSignal: Signal<FontFamilies | undefined>
      })
    | undefined
  > = signal(undefined)
  protected readonly childrenContainer = new Object3D<{ childadded: {}; childremoved: {} } & Object3DEventMap>()

  constructor() {
    super()
    this.childrenContainer.matrixAutoUpdate = false
    super.add(this.childrenContainer)
  }

  add(...objects: Array<Object3D>): this {
    const objectsLength = objects.length
    for (let i = 0; i < objectsLength; i++) {
      const object = objects[i]
      this.childrenContainer.add(object)
    }
    return this
  }

  addAt(object: Object3D, index: number): this {
    object.removeFromParent()
    object.parent = this.childrenContainer
    this.childrenContainer.children.splice(index, 0, object)
    object.dispatchEvent(_addedEvent)
    _childaddedEvent.child = object
    this.childrenContainer.dispatchEvent(_childaddedEvent)
    _childaddedEvent.child = null
    return this
  }

  remove(...objects: Array<Object3D>): this {
    const objectsLength = objects.length
    for (let i = 0; i < objectsLength; i++) {
      const object = objects[i]
      this.childrenContainer.remove(object)
    }
    return this
  }
}

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
