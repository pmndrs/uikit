import { Object3D } from 'three'
import { ContainerProperties, createContainer, destroyContainer } from '../components/container'
import { AllOptionalProperties, Properties } from '../properties/default'
import { Component } from '.'
import { EventConfig, bindHandlers } from './utils'
import { batch } from '@preact/signals-core'

export class Container extends Object3D {
  private object: Object3D
  public readonly internals: ReturnType<typeof createContainer>
  public readonly eventConfig: EventConfig

  constructor(parent: Component, properties: ContainerProperties, defaultProperties?: AllOptionalProperties) {
    super()

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
      properties,
      defaultProperties,
      { current: this.object },
      { current: this },
    )

    //setup scrolling & events
    this.add(this.internals.interactionPanel)
    bindHandlers(this.internals, this, this.internals.interactionPanel, this.eventConfig)
  }

  setProperties(properties: Properties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.internals.propertiesSignal.value = properties
      this.internals.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.object.parent?.remove(this.object)
    destroyContainer(this.internals)
  }
}
