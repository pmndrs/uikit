import { Object3D } from 'three'
import { AllOptionalProperties, Properties } from '../properties/default.js'
import { Parent } from './index.js'
import { EventConfig, bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { unsubscribeSubscriptions } from '../internals.js'
import { InputProperties, createInput } from '../components/input.js'

export class Input extends Object3D {
  private object: Object3D
  public readonly internals: ReturnType<typeof createInput>
  public readonly eventConfig: EventConfig

  private readonly propertiesSignal: Signal<InputProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  private textSignal?: Signal<Signal<string> | string>

  constructor(
    parent: Parent,
    value: string | Signal<string> = '',
    controlled: boolean = false,
    multiline: boolean = false,
    properties: InputProperties = {},
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.textSignal = signal(value)
    this.eventConfig = parent.eventConfig
    //setting up the threejs elements
    this.object = new Object3D()
    this.object.matrixAutoUpdate = false
    this.object.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.object)

    if (!controlled && value instanceof Signal) {
      throw new Error(`uncontrolled inputs can only receive string values`)
    }

    //setting up the text
    this.internals = createInput(
      parent.internals,
      controlled ? (this.textSignal = signal(value)) : value,
      multiline,
      parent.fontFamiliesSignal,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this.object },
    )

    //setup events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    bindHandlers(handlers, this, this.eventConfig, subscriptions)
  }

  setTabIndex(tabIndex: number) {
    this.internals.element.tabIndex = tabIndex
  }

  setValue(text: string | Signal<string>) {
    if (this.textSignal == null) {
      throw new Error(`cannot setValue on an uncontrolled input`)
    }
    this.textSignal.value = text
  }

  setProperties(properties: Properties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.object.parent?.remove(this.object)
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
