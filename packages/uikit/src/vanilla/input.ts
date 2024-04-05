import { Object3D } from 'three'
import { AllOptionalProperties, Properties } from '../properties/default.js'
import { Parent } from './index.js'
import { bindHandlers } from './utils.js'
import { Signal, batch, computed, signal } from '@preact/signals-core'
import { readReactive, unsubscribeSubscriptions } from '../internals.js'
import { InputProperties, createInput } from '../components/input.js'

export class Input extends Object3D {
  public readonly internals: ReturnType<typeof createInput>

  private readonly propertiesSignal: Signal<InputProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  private valueSignal: Signal<Signal<string> | string>

  constructor(
    parent: Parent,
    value: string | Signal<string> = '',
    private readonly controlled: boolean = false,
    multiline: boolean = false,
    properties: InputProperties = {},
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.valueSignal = signal(value)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    //setting up the threejs elements
    this.matrixAutoUpdate = false
    parent.add(this)

    if (!controlled && value instanceof Signal) {
      throw new Error(`uncontrolled inputs can only receive string values`)
    }

    //setting up the text
    this.internals = createInput(
      parent.internals,
      computed(() => readReactive(this.valueSignal.value)),
      (newValue) => {
        if (!controlled) {
          this.valueSignal.value = newValue
        }
        this.propertiesSignal.peek().onValueChange?.(newValue)
      },
      multiline,
      parent.fontFamiliesSignal,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this },
    )

    //setup events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    bindHandlers(handlers, this, subscriptions)
  }

  setTabIndex(tabIndex: number) {
    this.internals.element.tabIndex = tabIndex
  }

  setValue(text: string | Signal<string>) {
    if (!this.controlled) {
      throw new Error(`cannot setValue on an uncontrolled input`)
    }
    this.valueSignal.value = text
  }

  setProperties(properties: Properties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.parent?.remove(this)
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
