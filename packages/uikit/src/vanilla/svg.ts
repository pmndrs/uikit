import { Object3D } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { Parent } from './index.js'
import { EventConfig, bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { unsubscribeSubscriptions } from '../utils.js'
import { SVGProperties, createSVG } from '../components/svg.js'
import { FontFamilies } from '../internals.js'

export class SVG extends Object3D {
  public readonly internals: ReturnType<typeof createSVG>
  public readonly eventConfig: EventConfig
  public readonly fontFamiliesSignal: Signal<FontFamilies | undefined>

  private container: Object3D
  private readonly propertiesSignal: Signal<SVGProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private srcSignal: Signal<string | Signal<string>>

  constructor(
    parent: Parent,
    src: string | Signal<string>,
    properties: SVGProperties = {},
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.fontFamiliesSignal = parent.fontFamiliesSignal
    this.srcSignal = signal(src)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.eventConfig = parent.eventConfig
    this.container = new Object3D()
    this.container.matrixAutoUpdate = false
    this.container.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.container)
    this.internals = createSVG(
      parent.internals,
      this.srcSignal,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this.container },
      { current: this },
    )
    this.setProperties(properties, defaultProperties)

    const { handlers, centerGroup, interactionPanel, subscriptions } = this.internals
    this.container.add(interactionPanel)
    this.container.add(centerGroup)
    bindHandlers(handlers, this, this.eventConfig, subscriptions)
  }

  setSrc(src: string | Signal<string>) {
    this.srcSignal.value = src
  }

  setProperties(properties: SVGProperties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.container.parent?.remove(this.container)
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
