import { enum as enumSchema, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { theme } from '../theme.js'
export const DividerOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    orientation: enumSchema(['horizontal', 'vertical']).optional(),
  }).strict(),
)

export const DividerPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(DividerOutPropertiesSchema),
)

export type DividerOutProperties = BaseOutProperties & z.output<typeof DividerOutPropertiesSchema>

export type DividerProperties = z.input<typeof DividerPropertiesSchema>

export class Divider extends Container<DividerOutProperties> {
  constructor(
    inputProperties?: InProperties<DividerOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: any
      defaultOverrides?: InProperties<DividerOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexShrink: 0,
        backgroundColor: theme.component.progressBar.quickReplies.dividers,
        width: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? '100%' : 1)),
        height: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? 1 : '100%')),
        ...config?.defaultOverrides,
      },
    })
  }
}
