import { Object3D, Object3DEventMap } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { createParentContextSignal, setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { ContentProperties, setupContent, createContentState } from '../components/index.js'
import { MergedProperties } from '../properties/index.js'
import { ThreeEventMap } from '../events.js'

export class Content<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private mergedProperties?: ReadonlySignal<MergedProperties>
  private readonly contentContainer: Object3D
  private readonly styleSignal: Signal<ContentProperties<EM> | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<ContentProperties<EM> | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createContentState>

  constructor(properties?: ContentProperties<EM>, defaultProperties?: AllOptionalProperties) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    //setting up the threejs elements
    this.contentContainer = new Object3D()
    this.contentContainer.matrixAutoUpdate = false
    super.add(this.contentContainer)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const abortController = new AbortController()
      const state = createContentState(
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        { current: this.contentContainer },
      )
      this.internals = state
      this.mergedProperties = state.mergedProperties

      //setup content with state
      setupContent(
        state,
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this,
        this.contentContainer,
        abortController.signal,
      )

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
      const object = objects[i]
      this.contentContainer.add(object)
    }
    return this
  }

  remove(...objects: Array<Object3D>): this {
    const objectsLength = objects.length
    for (let i = 0; i < objectsLength; i++) {
      const object = objects[i]
      this.contentContainer.remove(object)
    }
    return this
  }

  getComputedProperty<K extends keyof ContentProperties<EM>>(key: K): ContentProperties<EM>[K] | undefined {
    return untracked(() => this.mergedProperties?.value.read(key as string, undefined))
  }

  getStyle(): undefined | Readonly<ContentProperties<EM>> {
    return this.styleSignal.peek()
  }

  setStyle(style: ContentProperties<EM> | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : ({ ...this.styleSignal.value, ...style } as any)
  }

  setProperties(properties: ContentProperties<EM> | undefined) {
    this.propertiesSignal.value = properties
  }

  setDefaultProperties(properties: AllOptionalProperties) {
    this.defaultPropertiesSignal.value = properties
  }

  destroy() {
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
