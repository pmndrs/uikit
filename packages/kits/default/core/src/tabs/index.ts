import { Container, ThreeEventMap, InProperties, BaseOutProperties, Properties, getProperty, RenderContext } from '@pmndrs/uikit'
import { signal, computed, Signal } from '@preact/signals-core'

export type TabsOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export type TabsProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<TabsOutProperties<EM>>

export class Tabs<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, TabsOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<TabsOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TabsOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
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

function computeCurrentValue(properties: Properties<TabsOutProperties>, uncontrolled: Signal<string | undefined>) {
  return computed(() => properties.value.value ?? uncontrolled.value)
}

export * from './list.js'
export * from './trigger.js'
export * from './content.js'
