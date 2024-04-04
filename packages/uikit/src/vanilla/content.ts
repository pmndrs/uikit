import { Object3D } from 'three'
import { AllOptionalProperties, Properties } from '../properties/default.js'
import { Parent } from './index.js'
import { EventMap, bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { Subscriptions, unsubscribeSubscriptions } from '../utils.js'
import { ContentProperties, createContent, FontFamilies } from '../internals.js'

export class Content extends Object3D<EventMap> {
  private object: Object3D
  public readonly internals: ReturnType<typeof createContent>
  public readonly fontFamiliesSignal: Signal<FontFamilies | undefined>

  private readonly propertiesSignal: Signal<ContentProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private contentSubscriptions: Subscriptions = []

  constructor(parent: Parent, properties: ContentProperties = {}, defaultProperties?: AllOptionalProperties) {
    super()
    this.fontFamiliesSignal = parent.fontFamiliesSignal
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    //setting up the threejs elements
    this.object = new Object3D()
    this.object.matrixAutoUpdate = false
    this.object.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.object)

    //setting up the container
    this.internals = createContent(parent.internals, this.propertiesSignal, this.defaultPropertiesSignal, {
      current: this.object,
    })

    //setup events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    bindHandlers(handlers, this, subscriptions)
  }

  setContent(...objects: Array<Object3D>) {
    this.remove(...this.children)
    this.add(...objects)
    unsubscribeSubscriptions(this.contentSubscriptions)
    this.internals.setupContent(this, this.contentSubscriptions)
  }

  setProperties(properties: Properties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.object.parent?.remove(this.object)
    unsubscribeSubscriptions(this.contentSubscriptions)
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
