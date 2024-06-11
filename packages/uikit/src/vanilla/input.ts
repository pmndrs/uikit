import { Object3D } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { createParentContextSignal, setupParentContextSignal, bindHandlers } from './utils.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { InputProperties, createInput } from '../components/input.js'
import { Subscriptions, initialize, unsubscribeSubscriptions } from '../utils.js'
import { MergedProperties } from '../properties/index.js'

export class Input extends Object3D {
  private mergedProperties?: ReadonlySignal<MergedProperties>
  private readonly styleSignal: Signal<InputProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<InputProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  constructor(properties?: InputProperties, defaultProperties?: AllOptionalProperties) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const internals = createInput(
        parentContext,
        parentContext.fontFamiliesSignal,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        { current: this },
      )
      this.mergedProperties = internals.mergedProperties

      //setup events
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

  getComputedProperty<K extends keyof InputProperties>(key: K): InputProperties[K] | undefined {
    return untracked(() => this.mergedProperties?.value.read(key, undefined))
  }

  getStyle(): undefined | Readonly<InputProperties> {
    return this.styleSignal.peek()
  }

  setStyle(style: InputProperties | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : { ...this.styleSignal.value, ...style }
  }

  setProperties(properties: InputProperties | undefined) {
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
