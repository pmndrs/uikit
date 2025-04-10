import { setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { effect, Signal, signal } from '@preact/signals-core'
import { AdditionalInputProperties, InputProperties, createInputState, setupInput } from '../components/input.js'
import { ThreeEventMap } from '../events.js'
import { ParentContext } from '../context.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Input<T = {}, Em extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly parentContextSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createInputState>

  constructor(
    multiline: boolean,
    private properties?: InputProperties<Em>,
  ) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const abortController = new AbortController()
      this.internals = createInputState(parentContext, multiline)
      this.internals.properties.setLayer(Layers.Imperative, this.properties)

      setupInput(this.internals, parentContext, this, abortController.signal)

      super.add(this.internals.interactionPanel)
      bindHandlers(this.internals.handlers, this, abortController.signal)

      return () => {
        this.remove(this.internals.interactionPanel)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys | keyof AdditionalInputProperties>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: InputProperties<Em>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
