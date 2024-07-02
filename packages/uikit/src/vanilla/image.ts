import { Texture } from 'three'
import { ImageProperties, createImage } from '../components/image.js'
import { AllOptionalProperties } from '../properties/default.js'
import { Parent, createParentContextSignal, setupParentContextSignal, bindHandlers } from './utils.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { Subscriptions, initialize, unsubscribeSubscriptions } from '../utils.js'
import { MergedProperties } from '../properties/index.js'

export class Image extends Parent {
  private mergedProperties?: ReadonlySignal<MergedProperties>
  private readonly styleSignal: Signal<ImageProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<ImageProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  protected readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createImage>

  constructor(properties?: ImageProperties, defaultProperties?: AllOptionalProperties) {
    super()
    setupParentContextSignal(this.parentContextSignal, this)
    this.matrixAutoUpdate = false
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const internals = (this.internals = createImage(
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        { current: this },
        { current: this.childrenContainer },
      ))
      this.mergedProperties = internals.mergedProperties
      this.contextSignal.value = Object.assign(internals, { fontFamiliesSignal: parentContext.fontFamiliesSignal })
      super.add(internals.interactionPanel)
      const subscriptions: Subscriptions = []
      initialize(internals.initializers, subscriptions)
      bindHandlers(internals.handlers, this, subscriptions)
      return () => {
        this.remove(internals.interactionPanel)
        unsubscribeSubscriptions(subscriptions)
      }
    })
  }

  getComputedProperty<K extends keyof ImageProperties>(key: K): ImageProperties[K] | undefined {
    return untracked(() => this.mergedProperties?.value.read(key, undefined))
  }

  getStyle(): undefined | Readonly<ImageProperties> {
    return this.styleSignal.peek()
  }

  setStyle(style: ImageProperties | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : { ...this.styleSignal.value, ...style }
  }

  setProperties(properties: ImageProperties | undefined) {
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
