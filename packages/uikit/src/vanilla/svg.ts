import { Object3D } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { Component } from './index.js'
import { EventConfig, bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { unsubscribeSubscriptions } from '../utils.js'
import { SVGProperties, createSVG } from '../components/svg.js'

export class SVG extends Object3D {
  public readonly internals: ReturnType<typeof createSVG>
  public readonly eventConfig: EventConfig

  private container: Object3D
  private readonly propertiesSignal: Signal<SVGProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(parent: Component, properties: SVGProperties, defaultProperties?: AllOptionalProperties) {
    super()
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
