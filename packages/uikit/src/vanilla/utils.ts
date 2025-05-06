import { Signal, signal } from '@preact/signals-core'
import { EventHandlers } from '../events.js'
import { BufferGeometry, Mesh, MeshBasicMaterial, Object3D, Object3DEventMap, Sphere } from 'three'
import { ParentContext } from '../context.js'
import { abortableEffect } from '../utils.js'
import { panelGeometry } from '../panel/index.js'

export function setupParentContextSignal(
  parentContextSignal: Signal<Signal<ParentContext | undefined> | null | undefined>,
  object: Object3D,
) {
  object.addEventListener('added', () => {
    if (!(object.parent instanceof Component)) {
      parentContextSignal.value = null
      return
    }
    parentContextSignal.value = object.parent.contextSignal
  })
  object.addEventListener('removed', () => (parentContextSignal.value = undefined))
}

export class Component<T = {}> extends Mesh<
  BufferGeometry,
  MeshBasicMaterial,
  EventMap & { childadded: {}; childremoved: {} } & T
> {
  readonly contextSignal: Signal<ParentContext | undefined> = signal(undefined)
  public readonly boundingSphere = new Sphere()

  constructor(material?: MeshBasicMaterial) {
    super(panelGeometry, material)
    this.matrixAutoUpdate = false
  }

  update(delta: number) {
    const context = this.contextSignal.peek()
    if (context == null) {
      return
    }
    for (const onFrame of context.root.onFrameSet) {
      onFrame(delta)
    }
  }
}

export function bindHandlers(handlers: Signal<EventHandlers>, container: Object3D<EventMap>, abortSignal: AbortSignal) {
  abortableEffect(() => {
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
  }, abortSignal)
}

function keyToEventName(key: keyof EventHandlers) {
  return key.slice(2).toLowerCase() as keyof EventMap
}

export type EventMap = Object3DEventMap & {
  [Key in keyof EventHandlers as Lowercase<Key extends `on${infer K}` ? K : never>]-?: Parameters<
    Exclude<EventHandlers[Key], undefined>
  >[0]
}
