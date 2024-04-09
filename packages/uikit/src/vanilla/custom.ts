import { Mesh, MeshBasicMaterial, Object3D } from 'three'
import { AllOptionalProperties, Properties } from '../properties/default.js'
import { Parent } from './index.js'
import { bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { unsubscribeSubscriptions } from '../utils.js'
import { CustomContainerProperties, FontFamilies, createCustomContainer, panelGeometry } from '../internals.js'

export class CustomContainer extends Object3D {
  public readonly internals: ReturnType<typeof createCustomContainer>
  public readonly fontFamiliesSignal: Signal<FontFamilies | undefined>

  private readonly styleSignal: Signal<CustomContainerProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<CustomContainerProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(parent: Parent, properties?: CustomContainerProperties, defaultProperties?: AllOptionalProperties) {
    super()
    this.fontFamiliesSignal = parent.fontFamiliesSignal
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    //setting up the threejs elements
    this.matrixAutoUpdate = false
    parent.add(this)

    //setting up the container
    this.internals = createCustomContainer(
      parent.internals,
      this.styleSignal,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      {
        current: this,
      },
    )

    //setup events
    const { handlers, subscriptions, setupMesh, setupMaterial } = this.internals
    //TODO: make the custom container the mesh
    const mesh = new Mesh(panelGeometry, new MeshBasicMaterial())
    setupMesh(mesh, subscriptions)
    setupMaterial(mesh.material)
    this.add(mesh)
    bindHandlers(handlers, this, subscriptions)
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
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
