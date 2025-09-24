import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'

export type TabsOutProperties = BaseOutProperties & {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export type TabsProperties = InProperties<TabsOutProperties>

export class Tabs extends Container<TabsOutProperties> {
  public readonly uncontrolledSignal = signal<string | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue,
  )

  constructor(
    inputProperties?: InProperties<TabsOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TabsOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'column',
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './list.js'
export * from './trigger.js'
export * from './content.js'
