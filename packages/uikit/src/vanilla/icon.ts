import { Object3D } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { createParentContextSignal, setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { Subscriptions, initialize, unsubscribeSubscriptions } from '../utils.js'
import { IconProperties, createIcon } from '../components/icon.js'
import { MergedProperties } from '../properties/index.js'

export class Icon extends Component {
  private mergedProperties?: ReadonlySignal<MergedProperties>
  private readonly styleSignal: Signal<IconProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<IconProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createIcon>

  constructor(
    text: string,
    svgWidth: number,
    svgHeight: number,
    properties?: IconProperties,
    defaultProperties?: AllOptionalProperties,
  ) {
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
      const internals = (this.internals = createIcon(
        parentContext,
        text,
        svgWidth,
        svgHeight,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        { current: this },
      ))
      this.mergedProperties = internals.mergedProperties

      super.add(internals.interactionPanel)
      super.add(internals.iconGroup)
      const subscriptions: Subscriptions = []
      initialize(internals.initializers, subscriptions)
      bindHandlers(internals.handlers, this, subscriptions)
      return () => {
        this.remove(internals.interactionPanel)
        this.remove(internals.iconGroup)
        unsubscribeSubscriptions(subscriptions)
      }
    })
  }

  getComputedProperty<K extends keyof IconProperties>(key: K): IconProperties[K] | undefined {
    return untracked(() => this.mergedProperties?.value.read(key, undefined))
  }

  getStyle(): undefined | Readonly<IconProperties> {
    return this.styleSignal.peek()
  }

  setStyle(style: IconProperties | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : { ...this.styleSignal.value, ...style }
  }

  setProperties(properties: IconProperties | undefined) {
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
