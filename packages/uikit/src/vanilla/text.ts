import { Object3D } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { createParentContextSignal, setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { TextProperties, createText } from '../components/text.js'
import { Subscriptions, initialize, unsubscribeSubscriptions } from '../utils.js'
import { MergedProperties } from '../properties/index.js'

export class Text extends Component {
  private mergedProperties?: ReadonlySignal<MergedProperties>
  private readonly styleSignal: Signal<TextProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<TextProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly textSignal: Signal<string | Signal<string> | Array<string | Signal<string>>>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createText>

  constructor(
    text: string | Signal<string> | Array<string | Signal<string>> = '',
    properties?: TextProperties,
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.textSignal = signal(text)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const internals = (this.internals = createText(
        parentContext,
        this.textSignal,
        parentContext.fontFamiliesSignal,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        { current: this },
      ))
      this.mergedProperties = internals.mergedProperties

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

  setText(text: string | Signal<string> | Array<string | Signal<string>>) {
    this.textSignal.value = text
  }

  getComputedProperty<K extends keyof TextProperties>(key: K): TextProperties[K] | undefined {
    return untracked(() => this.mergedProperties?.value.read(key, undefined))
  }

  getStyle(): undefined | Readonly<TextProperties> {
    return this.styleSignal.peek()
  }

  setStyle(style: TextProperties | undefined) {
    this.styleSignal.value = style
  }

  setProperties(properties: TextProperties | undefined) {
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
