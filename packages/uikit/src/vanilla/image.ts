import { createImageState, ImageProperties, setupImage } from '../components/image.js'
import { AllOptionalProperties } from '../properties/default.js'
import { Parent, createParentContextSignal, setupParentContextSignal, bindHandlers } from './utils.js'
import { Signal, effect, signal, untracked } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'

export class Image<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Parent<T> {
  private readonly styleSignal: Signal<ImageProperties<EM> | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<ImageProperties<EM> | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  protected readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createImageState>

  constructor(properties?: ImageProperties<EM>, defaultProperties?: AllOptionalProperties) {
    super()
    setupParentContextSignal(this.parentContextSignal, this)
    this.matrixAutoUpdate = false
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)

    this.unsubscribe = effect(() => {
      const parentContext = this.parentContextSignal.value?.value
      if (parentContext == null) {
        return
      }
      const abortController = new AbortController()
      this.internals = createImageState(
        parentContext,
        { current: this },
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
      )
      setupImage(
        this.internals,
        parentContext,
        this.styleSignal,
        this.propertiesSignal,
        this,
        this.childrenContainer,
        abortController.signal,
      )
      this.contextSignal.value = Object.assign(this.internals, { fontFamiliesSignal: parentContext.fontFamiliesSignal })
      super.add(this.internals.interactionPanel)
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(this.internals.interactionPanel)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends keyof ImageProperties<EM>>(key: K): ImageProperties<EM>[K] | undefined {
    return untracked(() => this.internals.mergedProperties?.value.read(key as string, undefined))
  }

  getStyle(): undefined | Readonly<ImageProperties<EM>> {
    return this.styleSignal.peek()
  }

  setStyle(style: ImageProperties<EM> | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : ({ ...this.styleSignal.value, ...style } as any)
  }

  setProperties(properties: ImageProperties<EM> | undefined) {
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
