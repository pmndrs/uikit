import { Signal, effect, signal } from '@preact/signals-core'
import { IconProperties, createIconState, setupIcon } from '../components/icon.js'
import { ThreeEventMap } from '../events.js'
import { LayerSectionStart } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'
import { Component } from './component.js'

export class Icon<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly parentContextSignalSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createIconState>

  constructor(
    text: string,
    svgWidth: number,
    svgHeight: number,
    private properties?: IconProperties<EM>,
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
      this.internals = createIconState(text, svgWidth, svgHeight, this, parentContext)
      this.internals.properties.setLayer(LayerSectionStart.Imperative, this.properties)

      setupIcon(this.internals, parentContext, abortController.signal)

      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: IconProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(LayerSectionStart.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
