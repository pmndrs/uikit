import { ContainerProperties, createContainerState, setupContainer } from '../components/container.js'
import { AllOptionalProperties } from '../properties/default.js'
import { Signal, effect, signal, untracked } from '@preact/signals-core'
import { Parent, createParentContextSignal, setupParentContextSignal, bindHandlers } from './utils.js'
import { ThreeEventMap } from '../events.js'

export class Container<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Parent<T> {
  private readonly styleSignal: Signal<ContainerProperties<EM> | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<ContainerProperties<EM> | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createContainerState>

  constructor(properties?: ContainerProperties<EM>, defaultProperties?: AllOptionalProperties) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        this.contextSignal.value = undefined
        return
      }
      const abortController = new AbortController()
      this.internals = createContainerState(
        parentContext,
        {
          current: this,
        },
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
      )
      setupContainer(
        this.internals,
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this,
        this.childrenContainer,
        abortController.signal,
      )
      this.contextSignal.value = Object.assign(this.internals, { fontFamiliesSignal: parentContext.fontFamiliesSignal })

      //setup events
      super.add(this.internals.interactionPanel)
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(this.internals.interactionPanel)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends keyof ContainerProperties<EM>>(key: K): ContainerProperties<EM>[K] | undefined {
    return untracked(() => this.internals.mergedProperties?.value.read(key as string, undefined))
  }

  getStyle(): undefined | Readonly<ContainerProperties<EM>> {
    return this.styleSignal.peek()
  }

  setStyle(style: ContainerProperties<EM> | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : ({ ...this.styleSignal.value, ...style } as any)
  }

  setProperties(properties: ContainerProperties<EM> | undefined) {
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
