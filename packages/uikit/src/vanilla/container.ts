import { Object3D } from 'three'
import { ContainerProperties, createContainer, destroyContainer } from '../components/container.js'
import { AllOptionalProperties, Properties } from '../properties/default.js'
import { Component } from './index.js'
import { EventConfig, bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'

export class Container extends Object3D {
  private object: Object3D
  public readonly internals: ReturnType<typeof createContainer>
  public readonly eventConfig: EventConfig

  private readonly propertiesSignal: Signal<ContainerProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(parent: Component, properties: ContainerProperties, defaultProperties?: AllOptionalProperties) {
    super()
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.eventConfig = parent.eventConfig
    //setting up the threejs elements
    this.object = new Object3D()
    this.object.matrixAutoUpdate = false
    this.object.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.object)

    //setting up the container
    this.internals = createContainer(
      parent.internals,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this.object },
      { current: this },
    )

    //setup scrolling & events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    bindHandlers(handlers, interactionPanel, this.eventConfig, subscriptions)
  }

  setProperties(properties: Properties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.object.parent?.remove(this.object)
    destroyContainer(this.internals)
  }
}
