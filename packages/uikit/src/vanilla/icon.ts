import { setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { IconProperties, createIconState, setupIcon } from '../components/icon.js'
import { ThreeEventMap } from '../events.js'
import { ParentContext } from '../context.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Icon<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly parentContextSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createIconState>

  constructor(
    text: string,
    svgWidth: number,
    svgHeight: number,
    private properties?: IconProperties<EM>,
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
      this.internals = createIconState(parentContext, text, svgWidth, svgHeight)
      this.internals.properties.setLayer(Layers.Imperative, this.properties)

      setupIcon(this.internals, parentContext, this, abortController.signal)

      super.add(this.internals.interactionPanel)
      super.add(this.internals.iconGroup)
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(this.internals.interactionPanel)
        this.remove(this.internals.iconGroup)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: IconProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
