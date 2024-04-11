import { Texture } from 'three'
import { ImageProperties, createImage } from '../components/image.js'
import { AllOptionalProperties } from '../properties/default.js'
import { Parent, createParentContextSignal, setupParentContextSignal, bindHandlers } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { Subscriptions, initialize, unsubscribeSubscriptions } from '../utils.js'

export class Image extends Parent {
  private readonly styleSignal: Signal<ImageProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<ImageProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly srcSignal: Signal<
    Signal<string | undefined> | string | Texture | Signal<Texture | undefined> | undefined
  >
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  constructor(src: string | Signal<string>, properties?: ImageProperties, defaultProperties?: AllOptionalProperties) {
    super()
    setupParentContextSignal(this.parentContextSignal, this)
    this.matrixAutoUpdate = false
    this.srcSignal = signal(src)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const internals = createImage(
        parentContext,
        this.srcSignal,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        { current: this },
        { current: this.childrenContainer },
      )
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

  setSrc(src: string | Signal<string> | Texture | Signal<Texture>) {
    this.srcSignal.value = src
  }

  setStyle(style: ImageProperties | undefined) {
    this.styleSignal.value = style
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
