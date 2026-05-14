import { custom, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import type { ToggleSize, ToggleVariant } from './item.js'
import { colors, componentDefaults } from '../theme.js'
export const ToggleGroupOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    variant: custom<ToggleVariant>((value) => typeof value === 'string').optional(),
    size: custom<ToggleSize>((value) => typeof value === 'string').optional(),
  }).strict(),
)

export const ToggleGroupPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(ToggleGroupOutPropertiesSchema),
)

export type ToggleGroupOutProperties = BaseOutProperties & z.output<typeof ToggleGroupOutPropertiesSchema>

export type ToggleGroupProperties = z.input<typeof ToggleGroupPropertiesSchema>

export class ToggleGroup extends Container<ToggleGroupOutProperties> {
  constructor(
    inputProperties?: ToggleGroupProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<ToggleGroupOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './item.js'
