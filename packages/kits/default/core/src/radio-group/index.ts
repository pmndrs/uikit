import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { componentDefaults } from '../theme.js'

export type RadioGroupOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  value?: string
  onValueChange?: (value?: string) => void
  defaultValue?: string
} & BaseOutProperties<EM>

export type RadioGroupProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<RadioGroupOutProperties<EM>>

export class RadioGroup<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  RadioGroupOutProperties<EM>
> {
  public readonly uncontrolledSignal = signal<string | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue,
  )

  constructor(
    inputProperties?: RadioGroupProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<RadioGroupOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './item.js'
