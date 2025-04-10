import { Parent, bindHandlers, setupParentContextSignal } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { AdditionalSvgProperties, createSvgState, setupSvg, SvgProperties } from '../components/index.js'
import { ThreeEventMap } from '../events.js'
import { ParentContext } from '../context.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Svg<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Parent<T> {
  private readonly parentContextSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createSvgState>

  constructor(private properties?: SvgProperties<EM>) {
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
      this.internals = createSvgState(parentContext, { current: this })
      setupSvg(this.internals, parentContext, this, this.childrenContainer, abortController.signal)
      this.internals.properties.setLayer(Layers.Imperative, this.properties)
      this.contextSignal.value = this.internals

      super.add(this.internals.interactionPanel)
      super.add(this.internals.centerGroup)
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(this.internals.interactionPanel)
        this.remove(this.internals.centerGroup)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys | keyof AdditionalSvgProperties>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: SvgProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
