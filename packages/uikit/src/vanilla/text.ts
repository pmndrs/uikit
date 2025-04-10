import { setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { createTextState, setupText, TextProperties } from '../components/text.js'
import { ThreeEventMap } from '../events.js'
import { ParentContext } from '../context.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Text<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly textSignal: Signal<unknown | Signal<unknown> | Array<unknown | Signal<unknown>>>
  private readonly parentContextSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createTextState>

  constructor(
    text: string | Signal<string> | Array<string | Signal<string>> = '',
    private properties?: TextProperties<EM>,
  ) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.textSignal = signal(text)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const abortController = new AbortController()
      const state = createTextState(parentContext, this.textSignal)
      this.internals = state
      this.internals.properties.setLayer(Layers.Imperative, this.properties)

      setupText(state, parentContext, this, abortController.signal)

      super.add(this.internals.interactionPanel)
      bindHandlers(state.handlers, this, abortController.signal)
      return () => {
        this.remove(this.internals.interactionPanel)
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
