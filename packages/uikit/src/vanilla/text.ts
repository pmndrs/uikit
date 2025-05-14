import { Signal, effect, signal } from '@preact/signals-core'
import { createTextState, setupText, TextProperties } from '../components/text.js'
import { ThreeEventMap } from '../events.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'
import { Component } from './component.js'

export class Text<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly textSignal: Signal<unknown | Signal<unknown> | Array<unknown | Signal<unknown>>>
  private readonly parentContextSignalSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createTextState>

  constructor(
    text: string | Signal<string> | Array<string | Signal<string>> = '',
    private properties?: TextProperties<EM>,
  ) {
    super()
    this.material.visible = false
    setupParentContextSignal(this.parentContextSignalSignal, this)
    this.textSignal = signal(text)

    this.unsubscribe = effect(() => {
      const parentContextSignal = this.parentContextSignalSignal.value
      if (parentContextSignal === undefined) {
        return
      }
      const parentContext = parentContextSignal?.value
      const abortController = new AbortController()
      const state = createTextState(this, this.textSignal, parentContext)
      this.internals = state
      this.internals.properties.setLayer(Layers.Imperative, this.properties)

      setupText(state, parentContext, abortController.signal)

      bindHandlers(state.handlers, this, abortController.signal)
      return () => {
        abortController.abort()
      }
    })
  }

  setText(text: string | Signal<string> | Array<string | Signal<string>>) {
    this.textSignal.value = text
  }

  getComputedProperty<K extends UikitPropertyKeys>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: TextProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
