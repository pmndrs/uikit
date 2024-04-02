import { Camera, Object3D } from 'three'
import { batch } from '@preact/signals-core'
import { AllOptionalProperties } from '../properties/default.js'
import { createRoot, destroyRoot, RootProperties } from '../components/root.js'
import { EventConfig, bindHandlers } from './utils.js'

export class Root extends Object3D {
  public readonly internals: ReturnType<typeof createRoot>
  private object: Object3D

  constructor(
    public readonly eventConfig: EventConfig,
    camera: Camera | (() => Camera),
    parent: Object3D,
    properties: RootProperties,
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.object = new Object3D()
    this.object.matrixAutoUpdate = false
    this.object.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.object)

    this.internals = createRoot(
      properties,
      defaultProperties,
      { current: this },
      { current: this },
      typeof camera === 'function' ? camera : () => camera,
    )

    //setup scrolling & events
    this.add(this.internals.interactionPanel)
    bindHandlers(this.internals, this, this.internals.interactionPanel, this.eventConfig)
  }

  update(delta: number) {
    for (const onFrame of this.internals.onFrameSet) {
      onFrame(delta)
    }
  }

  setProperties(properties: RootProperties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.internals.propertiesSignal.value = properties
      this.internals.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.object.parent?.remove(this.object)
    destroyRoot(this.internals)
  }
}
