import { Object3D, Object3DEventMap, Texture, Vector2Tuple } from 'three'
import { WithContext } from '../context'
import {
  InheritableImageProperties,
  createImage,
  createImageMesh,
  computeTextureAspectRatio,
  createImagePropertyTransformers,
  loadImageTexture,
  updateImageProperties,
  ImageProperties,
} from '../components/image'
import { Listeners, createListeners, updateListeners } from '../listeners'
import { Signal, effect, signal } from '@preact/signals-core'
import { MergedProperties, PropertyTransformers } from '../properties/merged'
import { Component, BindEventHandlers } from './utils'
import { Subscriptions, unsubscribeSubscriptions } from '../utils'
import { AllOptionalProperties } from '../properties/default'
import { EventHandlers } from '../events'

export class Image extends Object3D {
  private propertiesSignal: Signal<MergedProperties>
  private container: Object3D
  private subscriptions: Subscriptions = []
  private propertySubscriptions: Subscriptions = []
  private imageSubscriptions: Subscriptions = []
  private listeners = createListeners()
  private propertyTransformers: PropertyTransformers
  private hoveredSignal = signal<Array<number>>([])
  private activeSignal = signal<Array<number>>([])
  private texture = signal<Texture | undefined>(undefined)
  private textureAspectRatio: Signal<number | undefined>

  public readonly bindEventHandlers: BindEventHandlers
  public readonly ctx: WithContext
  private prevSrc?: ImageProperties['src']

  constructor(parent: Component, properties: ImageProperties, defaultProperties?: AllOptionalProperties) {
    super()
    this.textureAspectRatio = computeTextureAspectRatio(this.texture)
    const scrollHandlers = signal<EventHandlers>({})
    const rootSize = parent.ctx.root.node.size
    this.propertyTransformers = createImagePropertyTransformers(rootSize, this.hoveredSignal, this.activeSignal)
    this.bindEventHandlers = parent.bindEventHandlers
    this.container = new Object3D()
    this.container.matrixAutoUpdate = false
    this.container.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.container)
    this.propertiesSignal = signal(undefined as any)
    this.setProperties(properties, defaultProperties)
    this.ctx = createImage(
      this.propertiesSignal,
      { current: this.container },
      { current: this },
      parent.ctx,
      scrollHandlers,
      this.listeners,
      this.subscriptions,
    )
    const mesh = createImageMesh(this.propertiesSignal, this.texture, parent.ctx, this.ctx, this.subscriptions)
    this.container.add(mesh)
    this.subscriptions.push(effect(() => this.bindEventHandlers(mesh, scrollHandlers.value)))
  }

  setProperties(properties: ImageProperties, defaultProperties?: AllOptionalProperties) {
    if (properties.src != this.prevSrc) {
      unsubscribeSubscriptions(this.imageSubscriptions)
      loadImageTexture(this.texture, properties.src, this.imageSubscriptions)
      this.prevSrc = properties.src
    }
    unsubscribeSubscriptions(this.propertySubscriptions)
    const handlers = updateImageProperties(
      this.propertiesSignal,
      this.textureAspectRatio,
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
    unsubscribeSubscriptions(this.imageSubscriptions)
    unsubscribeSubscriptions(this.propertySubscriptions)
    unsubscribeSubscriptions(this.subscriptions)
  }
}
