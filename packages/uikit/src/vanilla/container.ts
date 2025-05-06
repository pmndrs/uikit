import { ContainerProperties, createContainerState, setupContainer } from '../components/container.js'
import { effect, signal, Signal } from '@preact/signals-core'
import { setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { ThreeEventMap } from '../events.js'
import { Layers } from '../properties/layers.js'
import { ParentContext } from '../context.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Container<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly parentContextSignalSignal: Signal<Signal<ParentContext | undefined> | undefined | null> =
    signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createContainerState<EM>>

  constructor(private properties?: ContainerProperties<EM>) {
    super()
    this.material.visible = false
    setupParentContextSignal(this.parentContextSignalSignal, this)
    this.unsubscribe = effect(() => {
      const parentContextSignal = this.parentContextSignalSignal.value
      if (parentContextSignal === undefined) {
        this.contextSignal.value = undefined
        return
      }
      const parentContext = parentContextSignal?.value
      const abortController = new AbortController()
      this.internals = createContainerState<EM>(this, parentContext)
      this.internals.properties.setLayer(Layers.Imperative, this.properties)
      setupContainer(this.internals, parentContext, abortController.signal)
      this.contextSignal.value = this.internals

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
