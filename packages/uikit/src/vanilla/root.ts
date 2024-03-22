import { Camera, Object3D, Vector2Tuple } from 'three'
import { WithContext } from '../context'
import { createListeners, updateListeners } from '../listeners'
import { Signal, effect, signal } from '@preact/signals-core'
import { MergedProperties, PropertyTransformers } from '../properties/merged'
import { Subscriptions, unsubscribeSubscriptions } from '../utils'
import { AllOptionalProperties } from '../properties/default'
import { createInteractionPanel } from '../panel/instanced-panel-mesh'
import { updateRootProperties, createRoot, createRootPropertyTransformers, RootProperties } from '../components/root'
import { EventHandlers } from '../events'

export class Root extends Object3D {
  private propertiesSignal: Signal<MergedProperties>
  private container: Object3D
  private subscriptions: Subscriptions = []
  private propertySubscriptions: Subscriptions = []
  private listeners = createListeners()
  private scrollHandlers = signal<EventHandlers>({})
  private onFrameSet = new Set<(delta: number) => void>()
  private propertyTransformers: PropertyTransformers
  private hoveredSignal = signal<Array<number>>([])
  private activeSignal = signal<Array<number>>([])

  public readonly ctx: WithContext

  constructor(
    camera: Camera | (() => Camera),
    object: Object3D,
    properties: RootProperties,
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    const rootSize = signal<Vector2Tuple>([0, 0])
    this.propertyTransformers = createRootPropertyTransformers(
      rootSize,
      this.hoveredSignal,
      this.activeSignal,
      properties.pixelSize,
    )
    this.container = new Object3D()
    this.container.matrixAutoUpdate = false
    this.container.add(this)
    this.matrixAutoUpdate = false
    object.add(this.container)
    this.propertiesSignal = signal(undefined as any)
    this.setProperties(properties, defaultProperties)
    this.ctx = createRoot(
      this.propertiesSignal,
      rootSize,
      { current: this.container },
      { current: this },
      this.scrollHandlers,
      this.listeners,
      properties.pixelSize,
      this.onFrameSet,
      typeof camera === 'function' ? camera : () => camera,
      this.subscriptions,
    )
    const interactionPanel = createInteractionPanel(
      this.ctx.node.size,
      this.ctx.root.pixelSize,
      this.ctx.orderInfo,
      undefined,
      this.ctx.root.object,
      this.subscriptions,
    )
    this.container.add(interactionPanel)
    this.subscriptions.push(effect(() => this.bindEventHandlers(interactionPanel, this.scrollHandlers.value)))
  }

  update(delta: number) {
    for (const onFrame of this.onFrameSet) {
      onFrame(delta)
    }
  }

  setProperties(properties: RootProperties, defaultProperties?: AllOptionalProperties) {
    const handlers = updateRootProperties(
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
