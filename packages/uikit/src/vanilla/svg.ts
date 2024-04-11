import { AllOptionalProperties } from '../properties/default.js'
import { Parent, createParentContextSignal, bindHandlers } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { Subscriptions, initialize, unsubscribeSubscriptions } from '../utils.js'
import { SvgProperties, createSvg } from '../components/svg.js'

export class Svg extends Parent {
  private readonly styleSignal: Signal<SvgProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<SvgProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly srcSignal: Signal<string | Signal<string>>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  constructor(src: string | Signal<string>, properties?: SvgProperties, defaultProperties?: AllOptionalProperties) {
    super()
    this.matrixAutoUpdate = false
    this.srcSignal = signal(src)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        this.contextSignal.value = undefined
        return
      }
      const internals = createSvg(
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
      super.add(internals.centerGroup)
      const subscriptions: Subscriptions = []
      initialize(internals.initializers, subscriptions)
      bindHandlers(internals.handlers, this, subscriptions)
      return () => {
        this.remove(internals.interactionPanel)
        this.remove(internals.centerGroup)
        unsubscribeSubscriptions(subscriptions)
      }
    })
  }

  setSrc(src: string | Signal<string>) {
    this.srcSignal.value = src
  }

  setStyle(style: SvgProperties | undefined) {
    this.styleSignal.value = style
  }

  setProperties(properties: SvgProperties | undefined) {
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
