import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'

export type RadioGroupOutProperties = {
  value?: string
  onValueChange?: (value?: string) => void
  defaultValue?: string
} & BaseOutProperties

export type RadioGroupProperties = InProperties<RadioGroupOutProperties>

export class RadioGroup extends Container<RadioGroupOutProperties> {
  public readonly uncontrolledSignal = signal<string | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue,
  )

  constructor(
    inputProperties?: RadioGroupProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<RadioGroupOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
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
