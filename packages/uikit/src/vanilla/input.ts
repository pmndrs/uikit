import { AllOptionalProperties } from '../properties/default.js'
import { createParentContextSignal, setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { InputProperties, createInputState, setupInput } from '../components/input.js'
import { MergedProperties } from '../properties/index.js'
import { ThreeEventMap } from '../events.js'

export class Input<T = {}, Em extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private mergedProperties?: ReadonlySignal<MergedProperties>
  private readonly styleSignal: Signal<InputProperties<Em> | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<InputProperties<Em> | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createInputState>

  constructor(properties?: InputProperties<Em>, defaultProperties?: AllOptionalProperties) {
    super()
    this.matrixAutoUpdate = false
    setupParentContextSignal(this.parentContextSignal, this)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const abortController = new AbortController()
      this.internals = createInputState(
        parentContext,
        parentContext.fontFamiliesSignal,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
      )

      setupInput(
        this.internals,
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        this,
        abortController.signal,
      )

      this.mergedProperties = this.internals.mergedProperties
      super.add(this.internals.interactionPanel)
      bindHandlers(this.internals.handlers, this, abortController.signal)

      return () => {
        this.remove(this.internals.interactionPanel)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends keyof InputProperties<Em>>(key: K): InputProperties<Em>[K] | undefined {
    return untracked(() => this.mergedProperties?.value.read(key as string, undefined))
  }

  getStyle(): undefined | Readonly<InputProperties<Em>> {
    return this.styleSignal.peek()
  }

  setStyle(style: InputProperties<Em> | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : ({ ...this.styleSignal.value, ...style } as any)
  }

  setProperties(properties: InputProperties<Em> | undefined) {
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
