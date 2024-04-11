import { Object3D } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { createParentContextSignal, setupParentContextSignal, bindHandlers } from './utils.js'
import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Subscriptions, initialize, readReactive, unsubscribeSubscriptions } from '../internals.js'
import { InputProperties, createInput } from '../components/input.js'

export class Input extends Object3D {
  private readonly styleSignal: Signal<InputProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<InputProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly valueSignal: Signal<Signal<string> | string>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  private element: HTMLInputElement | HTMLTextAreaElement | undefined

  constructor(
    value: string | Signal<string> = '',
    private readonly controlled: boolean = false,
    multiline: boolean = false,
    properties?: InputProperties,
    defaultProperties?: AllOptionalProperties,
    private tabIndex: number = 0,
  ) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.valueSignal = signal(value)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)

    if (!controlled && value instanceof Signal) {
      throw new Error(`uncontrolled inputs can only receive string values`)
    }

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const internals = createInput(
        parentContext,
        computed(() => readReactive(this.valueSignal.value)),
        (newValue) => {
          if (!controlled) {
            this.valueSignal.value = newValue
          }
          this.propertiesSignal.peek()?.onValueChange?.(newValue)
          this.styleSignal.peek()?.onValueChange?.(newValue)
        },
        multiline,
        parentContext.fontFamiliesSignal,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        { current: this },
      )

      //setup events
      super.add(internals.interactionPanel)
      const subscriptions: Subscriptions = []
      initialize(internals.initializers, subscriptions)
      this.element = internals.element.peek()!
      this.element.tabIndex = this.tabIndex
      bindHandlers(internals.handlers, this, subscriptions)
      return () => {
        this.remove(internals.interactionPanel)
        unsubscribeSubscriptions(subscriptions)
      }
    })
  }

  setTabIndex(tabIndex: number) {
    this.tabIndex = tabIndex
    if (this.element == null) {
      return
    }
    this.element.tabIndex = tabIndex
  }

  setValue(text: string | Signal<string>) {
    if (!this.controlled) {
      throw new Error(`cannot setValue on an uncontrolled input`)
    }
    this.valueSignal.value = text
  }

  setStyle(style: InputProperties | undefined) {
    this.styleSignal.value = style
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
