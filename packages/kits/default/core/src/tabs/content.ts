import { object, string } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext, searchFor } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Tabs } from './index.js'
import { colors, componentDefaults } from '../theme.js'
export const TabsContentOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    value: string().optional(),
  }).strict(),
)

export const TabsContentPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(TabsContentOutPropertiesSchema),
)

export type TabsContentOutProperties = BaseOutProperties & z.output<typeof TabsContentOutPropertiesSchema>

export type TabsContentProperties = z.input<typeof TabsContentPropertiesSchema>

export class TabsContent extends Container<TabsContentOutProperties> {
  constructor(
    inputProperties?: TabsContentProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TabsContentOutProperties> },
  ) {
    const isVisible = computed(() => {
      const tabs = searchFor(this, Tabs, 2)
      return this.properties.value.value === tabs?.currentSignal.value
    })
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        marginTop: 8,
        display: computed(() => (isVisible.value ? 'flex' : 'none')),
        ...config?.defaultOverrides,
      },
    })
  }
}
