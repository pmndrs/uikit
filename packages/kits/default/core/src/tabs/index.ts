import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { componentDefaults } from '../theme.js'

export type TabsOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export type TabsProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<TabsOutProperties<EM>>

export class Tabs<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, TabsOutProperties<EM>> {
  public readonly uncontrolledSignal = signal<string | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue,
  )

  constructor(
    inputProperties?: InProperties<TabsOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TabsOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './list.js'
export * from './trigger.js'
export * from './content.js'
