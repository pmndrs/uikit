import { effect, Signal, signal } from '@preact/signals-core'
import { AdditionalInputProperties, InputProperties, createInputState, setupInput } from '../components/input.js'
import { ThreeEventMap } from '../events.js'
import { LayerSectionStart } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'
import { Component } from './component.js'

export class Input<T = {}, Em extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly parentContextSignalSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createInputState>

  constructor(
    multiline: boolean,
    private properties?: InputProperties<Em>,
  ) {
    super()
    this.material.visible = false
    setupParentContextSignal(this.parentContextSignalSignal, this)

    this.unsubscribe = effect(() => {
      const parentContextSignal = this.parentContextSignalSignal.value
      if (parentContextSignal === undefined) {
        return
      }
      const parentContext = parentContextSignal?.value
      const abortController = new AbortController()
      this.internals = createInputState(this, multiline, parentContext)
      this.internals.properties.setLayer(LayerSectionStart.Imperative, this.properties)

      setupInput(this.internals, parentContext, abortController.signal)

      bindHandlers(this.internals.handlers, this, abortController.signal)

      return () => {
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys | keyof AdditionalInputProperties>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: InputProperties<Em>) {
    this.properties = properties
    this.internals.properties.setLayer(LayerSectionStart.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
