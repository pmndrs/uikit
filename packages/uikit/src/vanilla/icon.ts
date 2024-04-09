import { Object3D } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { Parent } from './index.js'
import { bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { unsubscribeSubscriptions } from '../utils.js'
import { IconProperties, createIcon } from '../components/icon.js'

export class Icon extends Object3D {
  public readonly internals: ReturnType<typeof createIcon>

  private readonly styleSignal: Signal<IconProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<IconProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(
    parent: Parent,
    text: string,
    svgWidth: number,
    svgHeight: number,
    properties?: IconProperties,
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.matrixAutoUpdate = false
    parent.add(this)
    this.internals = createIcon(
      parent.internals,
      text,
      svgWidth,
      svgHeight,
      this.styleSignal,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this },
    )

    const { handlers, iconGroup, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    this.add(iconGroup)
    bindHandlers(handlers, this, subscriptions)
  }

  setStyle(style: IconProperties | undefined) {
    this.styleSignal.value = style
  }

  setProperties(properties: IconProperties | undefined) {
    this.propertiesSignal.value = properties
  }

  setDefaultProperties(properties: AllOptionalProperties) {
    this.defaultPropertiesSignal.value = properties
  }

  destroy() {
    this.parent?.remove(this)
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
