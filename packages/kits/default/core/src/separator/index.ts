import { enum as enumSchema, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
import { computed } from '@preact/signals-core'
export const SeparatorOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    orientation: enumSchema(['horizontal', 'vertical']).optional(),
  }).strict(),
)

export const SeparatorPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(SeparatorOutPropertiesSchema),
)

export type SeperatorOutProperties = BaseOutProperties & z.output<typeof SeparatorOutPropertiesSchema>

export type SeparatorProperties = z.input<typeof SeparatorPropertiesSchema>

export class Separator extends Container<SeperatorOutProperties> {
  constructor(
    inputProperties?: InProperties<SeperatorOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: any
      defaultOverrides?: InProperties<SeperatorOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexShrink: 0,
        backgroundColor: colors.border,
        width: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? '100%' : 1)),
        height: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? 1 : '100%')),
        ...config?.defaultOverrides,
      },
    })
  }
}
