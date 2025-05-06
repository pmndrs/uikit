import { Object3D, Object3DEventMap } from 'three'
import { setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { Signal, effect, signal, untracked } from '@preact/signals-core'
import {
  setupContent,
  createContentState,
  ContentProperties,
  AdditionalContentProperties,
} from '../components/index.js'
import { ThreeEventMap } from '../events.js'
import { ParentContext } from '../context.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Content<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly parentContextSignalSignal: Signal<Signal<ParentContext | undefined> | undefined | null> =
    signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createContentState>

  constructor(private properties?: ContentProperties<EM>) {
    super()
    this.material.visible = false
    setupParentContextSignal(this.parentContextSignalSignal, this)
    //setting up the threejs elements

    this.unsubscribe = effect(() => {
      const parentContextSignal = this.parentContextSignalSignal.value
      if (parentContextSignal === undefined) {
        return
      }
      const parentContext = parentContextSignal?.value
      const abortController = new AbortController()
      const state = createContentState(this, parentContext)
      state.properties.setLayer(Layers.Imperative, this.properties)
      this.internals = state

      //setup content with state
      setupContent(state, parentContext, abortController.signal)

      //setup events
      bindHandlers(state.handlers, this, abortController.signal)
      this.addEventListener('childadded', state.remeasureContent)
      this.addEventListener('childremoved', state.remeasureContent)
      return () => {
        abortController.abort()
        this.removeEventListener('childadded', state.remeasureContent)
        this.removeEventListener('childremoved', state.remeasureContent)
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys | keyof AdditionalContentProperties>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: ContentProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
