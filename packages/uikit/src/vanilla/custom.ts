import { Mesh, MeshBasicMaterial } from 'three'
import { Signal, effect, signal } from '@preact/signals-core'
import { createCustomContainerState, CustomContainerProperties, setupCustomContainer } from '../components/index.js'
import { ThreeEventMap } from '../events.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'
import { Component } from './component.js'

export class CustomContainer<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly parentContextSignalSignal: Signal<Signal<ParentContext | undefined> | undefined | null> =
    signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createCustomContainerState>

  constructor(private properties?: CustomContainerProperties<EM>) {
    super(new MeshBasicMaterial())
    setupParentContextSignal(this.parentContextSignalSignal, this)

    this.unsubscribe = effect(() => {
      const parentContextSignal = this.parentContextSignalSignal.value
      if (parentContextSignal === undefined) {
        return
      }
      const parentContext = parentContextSignal?.value
      const abortController = new AbortController()
      this.internals = createCustomContainerState(this, parentContext)
      this.internals.properties.setLayer(Layers.Imperative, this.properties)

      setupCustomContainer(this.internals, parentContext, abortController.signal)

      //setup events
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: CustomContainerProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
    this.material.dispose()
  }
}
