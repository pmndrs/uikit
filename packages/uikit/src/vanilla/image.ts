import { AdditionalImageProperties, createImageState, ImageProperties, setupImage } from '../components/image.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { LayerSectionStart } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'
import { Component } from './component.js'

export class Image<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  protected readonly parentContextSignalSignal: Signal<Signal<ParentContext | undefined> | undefined | null> =
    signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createImageState>

  constructor(private properties?: ImageProperties<EM>) {
    super()
    setupParentContextSignal(this.parentContextSignalSignal, this)
    this.unsubscribe = effect(() => {
      const parentContextSignal = this.parentContextSignalSignal.value
      if (parentContextSignal === undefined) {
        this.contextSignal.value = undefined
        return
      }
      const parentContext = parentContextSignal?.value
      const abortController = new AbortController()
      this.internals = createImageState(this, parentContext)
      this.internals.properties.setLayer(LayerSectionStart.Imperative, this.properties)
      setupImage(this.internals, parentContext, abortController.signal)
      this.contextSignal.value = this.internals
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys | keyof AdditionalImageProperties>(key: K) {
    return this.internals.properties.peek<K>(key)
  }

  setProperties(properties?: ImageProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(LayerSectionStart.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
