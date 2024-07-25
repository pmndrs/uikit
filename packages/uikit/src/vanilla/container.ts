import { ContainerProperties, createContainer } from '../components/container.js'
import { AllOptionalProperties } from '../properties/default.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { Subscriptions, initialize, unsubscribeSubscriptions } from '../utils.js'
import { Parent, createParentContextSignal, setupParentContextSignal, bindHandlers } from './utils.js'
import { MergedProperties } from '../properties/index.js'

export class Container extends Parent {
  private mergedProperties?: ReadonlySignal<MergedProperties>
  private readonly styleSignal: Signal<ContainerProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<ContainerProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createContainer>

  constructor(properties?: ContainerProperties, defaultProperties?: AllOptionalProperties) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        this.contextSignal.value = undefined
        return
      }
      const internals = (this.internals = createContainer(
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        { current: this },
        { current: this.childrenContainer },
      ))
      this.mergedProperties = internals.mergedProperties
      this.contextSignal.value = Object.assign(internals, { fontFamiliesSignal: parentContext.fontFamiliesSignal })

      //setup events
      const subscriptions: Subscriptions = []
      super.add(internals.interactionPanel)
      initialize(internals.initializers, subscriptions)
      bindHandlers(internals.handlers, this, subscriptions)
      return () => {
        this.remove(internals.interactionPanel)
        unsubscribeSubscriptions(subscriptions)
      }
    })
  }

  getComputedProperty<K extends keyof ContainerProperties>(key: K): ContainerProperties[K] | undefined {
    return untracked(() => this.mergedProperties?.value.read(key, undefined))
  }

  getStyle(): undefined | Readonly<ContainerProperties> {
    return this.styleSignal.peek()
  }

  setStyle(style: ContainerProperties | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : { ...this.styleSignal.value, ...style }
  }

  setProperties(properties: ContainerProperties | undefined) {
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
