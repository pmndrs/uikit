import { ContainerProperties, createContainerState, setupContainer } from '../components/container.js'
import { effect, signal, Signal } from '@preact/signals-core'
import { Parent, setupParentContextSignal, bindHandlers } from './utils.js'
import { ThreeEventMap } from '../events.js'
import { Layers } from '../properties/layers.js'
import { ParentContext } from '../context.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Container<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Parent<T> {
  private readonly parentContextSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createContainerState<EM>>

  constructor(private properties?: ContainerProperties<EM>) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        this.contextSignal.value = undefined
        return
      }
      const abortController = new AbortController()
      this.internals = createContainerState<EM>(parentContext, {
        current: this,
      })
      this.internals.properties.setLayer(Layers.Imperative, this.properties)
      setupContainer(this.internals, parentContext, this, this.childrenContainer, abortController.signal)
      this.contextSignal.value = this.internals

      //setup events
      super.add(this.internals.interactionPanel)
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(this.internals.interactionPanel)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: ContainerProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
