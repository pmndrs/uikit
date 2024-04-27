import { Mesh, MeshBasicMaterial, Object3D } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { createParentContextSignal, setupParentContextSignal, bindHandlers } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { Subscriptions, initialize, unsubscribeSubscriptions } from '../utils.js'
import { CustomContainerProperties, createCustomContainer } from '../components/index.js'
import { panelGeometry } from '../panel/index.js'

export class CustomContainer extends Object3D {
  private readonly styleSignal: Signal<CustomContainerProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<CustomContainerProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  constructor(properties?: CustomContainerProperties, defaultProperties?: AllOptionalProperties) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)

    const mesh = new Mesh(panelGeometry, new MeshBasicMaterial())
    super.add(mesh)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const internals = createCustomContainer(
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        {
          current: this,
        },
        {
          current: mesh,
        },
      )

      //setup events
      //TODO make the container the mesh
      const subscriptions: Subscriptions = []
      initialize(internals.initializers, subscriptions)
      bindHandlers(internals.handlers, this, subscriptions)
      return () => {
        this.remove(mesh)
        unsubscribeSubscriptions(subscriptions)
      }
    })
  }

  setStyle(style: CustomContainerProperties | undefined) {
    this.styleSignal.value = style
  }

  setProperties(properties: CustomContainerProperties | undefined) {
    this.propertiesSignal.value = properties
  }

  setDefaultProperties(properties: AllOptionalProperties) {
    this.defaultPropertiesSignal.value = properties
  }

  destroy() {
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
