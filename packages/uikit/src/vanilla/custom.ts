import { Mesh, MeshBasicMaterial, Object3D } from 'three'
import { AllOptionalProperties, Properties } from '../properties/default.js'
import { Parent } from './index.js'
import { EventConfig, bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { unsubscribeSubscriptions } from '../utils.js'
import { CustomContainerProperties, FontFamilies, createCustomContainer, panelGeometry } from '../internals.js'

export class CustomContainer extends Object3D {
  private object: Object3D
  public readonly internals: ReturnType<typeof createCustomContainer>
  public readonly eventConfig: EventConfig
  public readonly fontFamiliesSignal: Signal<FontFamilies | undefined>

  private readonly propertiesSignal: Signal<CustomContainerProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(parent: Parent, properties: CustomContainerProperties = {}, defaultProperties?: AllOptionalProperties) {
    super()
    this.fontFamiliesSignal = parent.fontFamiliesSignal
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
    this.internals = createCustomContainer(parent.internals, this.propertiesSignal, this.defaultPropertiesSignal, {
      current: this.object,
    })

    //setup events
    const { handlers, subscriptions, setupMesh, setupMaterial } = this.internals
    //TODO: make the custom container the mesh
    const mesh = new Mesh(panelGeometry, new MeshBasicMaterial())
    setupMesh(mesh)
    setupMaterial(mesh.material)
    this.add(mesh)
    bindHandlers(handlers, this, this.eventConfig, subscriptions)
  }

  setProperties(properties: Properties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.object.parent?.remove(this.object)
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
