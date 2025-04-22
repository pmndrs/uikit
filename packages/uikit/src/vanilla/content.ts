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
  private readonly contentContainer: Object3D
  private readonly parentContextSignalSignal: Signal<Signal<ParentContext | undefined> | undefined | null> =
    signal(undefined)
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createContentState>

  constructor(private properties?: ContentProperties<EM>) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignalSignal, this)
    //setting up the threejs elements
    this.contentContainer = new Object3D()
    this.contentContainer.matrixAutoUpdate = false
    super.add(this.contentContainer)

    this.unsubscribe = effect(() => {
      const parentContextSignal = this.parentContextSignalSignal.value
      if (parentContextSignal === undefined) {
        return
      }
      const parentContext = parentContextSignal?.value
      const abortController = new AbortController()
      const state = createContentState({ current: this }, { current: this.contentContainer }, parentContext)
      state.properties.setLayer(Layers.Imperative, this.properties)
      this.internals = state

      //setup content with state
      setupContent(state, parentContext, this, this.contentContainer, abortController.signal)

      //setup events
      super.add(this.internals.interactionPanel)
      bindHandlers(state.handlers, this, abortController.signal)
      this.addEventListener('childadded', state.remeasureContent)
      this.addEventListener('childremoved', state.remeasureContent)
      return () => {
        this.remove(this.internals.interactionPanel)
        abortController.abort()
        this.removeEventListener('childadded', state.remeasureContent)
        this.removeEventListener('childremoved', state.remeasureContent)
      }
    })
  }

  add(...objects: Object3D<Object3DEventMap>[]): this {
    const objectsLength = objects.length
    for (let i = 0; i < objectsLength; i++) {
      const object = objects[i]!
      this.contentContainer.add(object)
    }
    return this
  }

  remove(...objects: Array<Object3D>): this {
    const objectsLength = objects.length
    for (let i = 0; i < objectsLength; i++) {
      const object = objects[i]!
      this.contentContainer.remove(object)
    }
    return this
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
