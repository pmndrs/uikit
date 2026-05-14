import { custom, object, string } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'
export const TabsOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    value: string().optional(),
    onValueChange: custom<(value: string) => void>((value) => typeof value === 'function').optional(),
    defaultValue: string().optional(),
  }).strict(),
)

export const TabsPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(TabsOutPropertiesSchema),
)

export type TabsOutProperties = BaseOutProperties & z.output<typeof TabsOutPropertiesSchema>

export type TabsProperties = z.input<typeof TabsPropertiesSchema>

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
