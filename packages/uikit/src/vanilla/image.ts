import { AdditionalImageProperties, createImageState, ImageProperties, setupImage } from '../components/image.js'
import { Parent, setupParentContextSignal, bindHandlers } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { ParentContext } from '../context.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Image<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Parent<T> {
  protected readonly parentContextSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createImageState>

  constructor(private properties?: ImageProperties<EM>) {
    super()
    setupParentContextSignal(this.parentContextSignal, this)
    this.matrixAutoUpdate = false

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const abortController = new AbortController()
      this.internals = createImageState(parentContext, { current: this })
      this.internals.properties.setLayer(Layers.Imperative, this.properties)
      setupImage(this.internals, parentContext, this, this.childrenContainer, abortController.signal)
      this.contextSignal.value = this.internals
      super.add(this.internals.interactionPanel)
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(this.internals.interactionPanel)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys | keyof AdditionalImageProperties>(key: K) {
    return this.internals.properties.peek<K>(key)
  }

  setProperties(properties?: ImageProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
