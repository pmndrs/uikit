import { Object3D } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { Parent } from './index.js'
import { bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { unsubscribeSubscriptions } from '../utils.js'
import { IconProperties, createIcon } from '../components/icon.js'

export class Icon extends Object3D {
  public readonly internals: ReturnType<typeof createIcon>

  private readonly propertiesSignal: Signal<IconProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(
    parent: Parent,
    text: string,
    svgWidth: number,
    svgHeight: number,
    properties: IconProperties = {},
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
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this },
    )
    this.setProperties(properties, defaultProperties)

    const { handlers, iconGroup, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    this.add(iconGroup)
    bindHandlers(handlers, this, subscriptions)
  }

  setProperties(properties: IconProperties, defaultProperties?: AllOptionalProperties) {
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
