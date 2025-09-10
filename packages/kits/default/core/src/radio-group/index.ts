import {
  Container,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  Properties,
  getProperty,
  RenderContext,
} from '@pmndrs/uikit'
import { signal, computed, Signal } from '@preact/signals-core'

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
  constructor(
    inputProperties?: RadioGroupProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<RadioGroupOutProperties<EM>> },
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

  getUncontrolledSignal() {
    return getProperty(this, 'uncontrolled', () => computeDefaultValue(this.properties.peek().defaultValue))
  }

  getCurrentValueSignal() {
    return getProperty(this, 'currentValue', () => computeCurrentValue(this.properties, this.getUncontrolledSignal()))
  }
}

function computeDefaultValue(defaultValue: string | undefined) {
  return signal<string | undefined>(defaultValue)
}

function computeCurrentValue(
  properties: Properties<RadioGroupOutProperties>,
  uncontrolled: Signal<string | undefined>,
) {
  return computed(() => properties.value.value ?? uncontrolled.value)
}

export * from './item.js'
