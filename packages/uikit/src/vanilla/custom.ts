import { Mesh, MeshBasicMaterial } from 'three'
import { AllOptionalProperties } from '../properties/default.js'
import { createParentContextSignal, setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { CustomContainerProperties, createCustomContainerState, setupCustomContainer } from '../components/index.js'
import { panelGeometry } from '../panel/index.js'
import { MergedProperties } from '../properties/index.js'
import { ThreeEventMap } from '../events.js'

export class CustomContainer<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly styleSignal: Signal<CustomContainerProperties<EM> | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<CustomContainerProperties<EM> | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void
  private readonly material = new MeshBasicMaterial()

  public internals!: ReturnType<typeof createCustomContainerState>

  constructor(properties?: CustomContainerProperties<EM>, defaultProperties?: AllOptionalProperties) {
    super()
    //TODO make the container the mesh
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)

    const mesh = new Mesh(panelGeometry, this.material)
    super.add(mesh)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const abortController = new AbortController()
      this.internals = createCustomContainerState(
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
      )

      setupCustomContainer(
        this.internals,
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this,
        mesh,
        abortController.signal,
      )

      //setup events
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(mesh)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends keyof CustomContainerProperties<EM>>(
    key: K,
  ): CustomContainerProperties<EM>[K] | undefined {
    return untracked(() => this.internals.mergedProperties?.value.read(key as string, undefined))
  }

  getStyle(): undefined | Readonly<CustomContainerProperties<EM>> {
    return this.styleSignal.peek()
  }

  setStyle(style: CustomContainerProperties<EM> | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : ({ ...this.styleSignal.value, ...style } as any)
  }

  setProperties(properties: CustomContainerProperties<EM> | undefined) {
    this.propertiesSignal.value = properties
  }

  setDefaultProperties(properties: AllOptionalProperties) {
    this.defaultPropertiesSignal.value = properties
  }

  destroy() {
    this.parent?.remove(this)
    this.unsubscribe()
    this.material.dispose()
  }
}
