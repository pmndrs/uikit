import { Mesh, MeshBasicMaterial } from 'three'
import { setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { Signal, effect, signal } from '@preact/signals-core'
import { createCustomContainerState, CustomContainerProperties, setupCustomContainer } from '../components/index.js'
import { panelGeometry } from '../panel/index.js'
import { ThreeEventMap } from '../events.js'
import { ParentContext } from '../context.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class CustomContainer<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly parentContextSignal: Signal<Signal<ParentContext | undefined> | undefined> = signal(undefined)
  private readonly unsubscribe: () => void
  private readonly material = new MeshBasicMaterial()

  public internals!: ReturnType<typeof createCustomContainerState>

  constructor(private properties?: CustomContainerProperties<EM>) {
    super()
    //TODO make the container the mesh
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)

    const mesh = new Mesh(panelGeometry, this.material)
    super.add(mesh)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const abortController = new AbortController()
      this.internals = createCustomContainerState(parentContext)
      this.internals.properties.setLayer(Layers.Imperative, this.properties)

      setupCustomContainer(this.internals, parentContext, this, mesh, abortController.signal)

      //setup events
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(mesh)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends UikitPropertyKeys>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: CustomContainerProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
    this.material.dispose()
  }
}
