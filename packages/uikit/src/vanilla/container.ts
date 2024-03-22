import { Object3D } from 'three'
import { WithContext } from '../context'
import {
  ContainerProperties,
  ContainerState,
  cleanContainerState,
  createContainerContext,
  createContainerState,
  updateContainerProperties,
} from '../components/container'
import { effect } from '@preact/signals-core'
import { AllOptionalProperties } from '../properties/default'
import { createInteractionPanel } from '../panel/instanced-panel-mesh'
import { EventHandlers } from '../events'
import { Component } from '.'

export class Container extends Object3D {
  public readonly ctx: WithContext
  private state: ContainerState
  private container: Object3D
  private prevHandlers?: EventHandlers

  constructor(parent: Component, properties: ContainerProperties, defaultProperties?: AllOptionalProperties) {
    super()

    //setting up the threejs elements
    this.container = new Object3D()
    this.container.matrixAutoUpdate = false
    this.container.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.container)

    //setting up the container
    this.state = createContainerState(parent.ctx.root.node.size)
    this.setProperties(properties, defaultProperties)
    this.ctx = createContainerContext(this.state, { current: this.container }, { current: this }, parent.ctx)

    //setup scrolling & events
    const interactionPanel = createInteractionPanel(this.ctx, parent.ctx, this.state.subscriptions)
    this.container.add(interactionPanel)
    this.state.subscriptions.push(
      effect(() => {
        const scrollHandlers = this.state.scrollHandlers.value
        this.ctx.root.bindEventHandlers(interactionPanel, scrollHandlers)
        return () => this.ctx.root.unbindEventHandlers(interactionPanel, scrollHandlers)
      }),
    )
  }

  setProperties(properties: ContainerProperties, defaultProperties?: AllOptionalProperties) {
    if (this.prevHandlers != null) {
      this.ctx.root.unbindEventHandlers(this.container, this.prevHandlers)
    }
    const handlers = updateContainerProperties(this.state, properties, defaultProperties)
    this.ctx.root.bindEventHandlers(this.container, handlers)
    this.prevHandlers = handlers
  }

  destroy() {
    this.container.parent?.remove(this.container)
    cleanContainerState(this.state)
  }
}
