import { Object3D } from 'three'
import { ImageProperties, createImage, destroyImage } from '../components/image.js'
import { AllOptionalProperties } from '../properties/default.js'
import { Component } from './index.js'
import { EventConfig, bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'

export class Image extends Object3D {
  public readonly internals: ReturnType<typeof createImage>
  public readonly eventConfig: EventConfig

  private container: Object3D
  private readonly propertiesSignal: Signal<ImageProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(parent: Component, properties: ImageProperties, defaultProperties?: AllOptionalProperties) {
    super()
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.eventConfig = parent.eventConfig
    this.container = new Object3D()
    this.container.matrixAutoUpdate = false
    this.container.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.container)
    this.internals = createImage(
      parent.internals,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this },
      { current: this.container },
    )
    this.setProperties(properties, defaultProperties)

    const { handlers, interactionPanel, subscriptions } = this.internals
    this.container.add(interactionPanel)
    bindHandlers(handlers, interactionPanel, this.eventConfig, subscriptions)
  }

  setProperties(properties: ImageProperties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.container.parent?.remove(this.container)
    destroyImage(this.internals)
  }
}
