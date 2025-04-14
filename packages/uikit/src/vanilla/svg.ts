import { AllOptionalProperties } from '../properties/default.js'
import { Parent, createParentContextSignal, bindHandlers, setupParentContextSignal } from './utils.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { SvgProperties, createSvgState, setupSvg } from '../components/index.js'
import { MergedProperties } from '../properties/index.js'
import { ThreeEventMap } from '../events.js'

export class Svg<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Parent<T> {
  private mergedProperties?: ReadonlySignal<MergedProperties>
  private readonly styleSignal: Signal<SvgProperties<EM> | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<SvgProperties<EM> | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createSvgState>

  constructor(properties?: SvgProperties<EM>, defaultProperties?: AllOptionalProperties) {
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
      this.internals = createSvgState(
        parentContext,
        { current: this },
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
      )
      setupSvg(
        this.internals,
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this,
        this.childrenContainer,
        abortController.signal,
      )
      this.mergedProperties = this.internals.mergedProperties
      this.contextSignal.value = Object.assign(this.internals, { fontFamiliesSignal: parentContext.fontFamiliesSignal })

      super.add(this.internals.interactionPanel)
      super.add(this.internals.centerGroup)
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(this.internals.interactionPanel)
        this.remove(this.internals.centerGroup)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends keyof SvgProperties<EM>>(key: K): SvgProperties<EM>[K] | undefined {
    return untracked(() => this.mergedProperties?.value.read(key as string, undefined))
  }

  getStyle(): undefined | Readonly<SvgProperties<EM>> {
    return this.styleSignal.peek()
  }

  setStyle(style: SvgProperties<EM> | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : ({ ...this.styleSignal.value, ...style } as any)
  }

  setProperties(properties: SvgProperties<EM> | undefined) {
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
