import { Object3D } from 'three'
import { WithContext } from '../context'
import {
  ContainerProperties,
  createContainer,
  createContainerPropertyTransfomers,
  updateContainerProperties,
} from '../components/container'
import { createListeners, updateListeners } from '../listeners'
import { Signal, effect, signal } from '@preact/signals-core'
import { MergedProperties, PropertyTransformers } from '../properties/merged'
import { Component, BindEventHandlers } from './utils'
import { Subscriptions, unsubscribeSubscriptions } from '../utils'
import { AllOptionalProperties } from '../properties/default'
import { createInteractionPanel } from '../panel/instanced-panel-mesh'
import { EventHandlers } from '../events'

export class Container extends Object3D {
  private propertiesSignal: Signal<MergedProperties>
  private container: Object3D
  private subscriptions: Subscriptions = []
  private propertySubscriptions: Subscriptions = []
  private listeners = createListeners()
  private propertyTransformers: PropertyTransformers
  private hoveredSignal = signal<Array<number>>([])
  private activeSignal = signal<Array<number>>([])

  public readonly bindEventHandlers: BindEventHandlers
  public readonly ctx: WithContext

  constructor(parent: Component, properties: ContainerProperties, defaultProperties?: AllOptionalProperties) {
    super()
    const scrollHandlers = signal<EventHandlers>({})
    const rootSize = parent.ctx.root.node.size
    this.propertyTransformers = createContainerPropertyTransfomers(rootSize, this.hoveredSignal, this.activeSignal)
    this.bindEventHandlers = parent.bindEventHandlers
    this.container = new Object3D()
    this.container.matrixAutoUpdate = false
    this.container.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.container)
    this.propertiesSignal = signal(undefined as any)
    this.setProperties(properties, defaultProperties)
    this.ctx = createContainer(
      this.propertiesSignal,
      { current: this.container },
      { current: this },
      parent.ctx,
      scrollHandlers,
      this.listeners,
      this.subscriptions,
    )
    const interactionPanel = createInteractionPanel(
      this.ctx.node.size,
      this.ctx.root.pixelSize,
      this.ctx.orderInfo,
      parent.ctx.clippingRect,
      this.ctx.root.object,
      this.subscriptions,
    )
    this.container.add(interactionPanel)
    this.subscriptions.push(effect(() => this.bindEventHandlers(interactionPanel, scrollHandlers.value)))
  }

  setProperties(properties: ContainerProperties, defaultProperties?: AllOptionalProperties) {
    const handlers = updateContainerProperties(
      this.propertiesSignal,
      properties,
      defaultProperties,
      this.hoveredSignal,
      this.activeSignal,
      this.propertyTransformers,
      this.propertySubscriptions,
    )
    this.bindEventHandlers(this.container, handlers)
    updateListeners(this.listeners, properties)
  }

  destroy() {
    this.container.parent?.remove(this.container)
    unsubscribeSubscriptions(this.propertySubscriptions)
    unsubscribeSubscriptions(this.subscriptions)
  }
}
