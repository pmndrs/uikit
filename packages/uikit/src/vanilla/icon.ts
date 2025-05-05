import { AllOptionalProperties } from '../properties/default.js'
import { createParentContextSignal, setupParentContextSignal, bindHandlers, Component } from './utils.js'
import { ReadonlySignal, Signal, effect, signal, untracked } from '@preact/signals-core'
import { IconProperties, createIconState, setupIcon } from '../components/icon.js'
import { MergedProperties } from '../properties/index.js'
import { ThreeEventMap } from '../events.js'

export class Icon<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T> {
  private readonly styleSignal: Signal<IconProperties<EM> | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<IconProperties<EM> | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly parentContextSignal = createParentContextSignal()
  private readonly unsubscribe: () => void

  public internals!: ReturnType<typeof createIconState>

  constructor(
    text: string,
    svgWidth: number,
    svgHeight: number,
    properties?: IconProperties<EM>,
    defaultProperties?: AllOptionalProperties,
  ) {
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
      this.internals = createIconState(
        parentContext,
        text,
        svgWidth,
        svgHeight,
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
      )

      setupIcon(this.internals, parentContext, this.styleSignal, this.propertiesSignal, this, abortController.signal)

      super.add(this.internals.interactionPanel)
      super.add(this.internals.iconGroup)
      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.remove(this.internals.interactionPanel)
        this.remove(this.internals.iconGroup)
        abortController.abort()
      }
    })
  }

  getComputedProperty<K extends keyof IconProperties<EM>>(key: K): IconProperties<EM>[K] | undefined {
    return untracked(() => this.internals.mergedProperties?.value.read(key as string, undefined))
  }

  getStyle(): undefined | Readonly<IconProperties<EM>> {
    return this.styleSignal.peek()
  }

  setStyle(style: IconProperties<EM> | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : ({ ...this.styleSignal.value, ...style } as any)
  }

  setProperties(properties: IconProperties<EM> | undefined) {
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
