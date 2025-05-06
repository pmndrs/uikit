import { bindHandlers, Component, setupParentContextSignal } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { AdditionalSvgProperties, createSvgState, setupSvg, SvgProperties } from '../components/index.js'
import { ThreeEventMap } from '../events.js'
import { ParentContext } from '../context.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Svg<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly parentContextSignalSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createSvgState>

  constructor(private properties?: SvgProperties<EM>) {
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
      this.internals = createSvgState(this, parentContext)
      setupSvg(this.internals, parentContext, abortController.signal)
      this.internals.properties.setLayer(Layers.Imperative, this.properties)
      this.contextSignal.value = this.internals

      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
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
