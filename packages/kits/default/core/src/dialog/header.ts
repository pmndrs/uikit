import type { z } from 'zod'
import { baseOutPropertiesSchema, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const DialogHeaderOutPropertiesSchema = baseOutPropertiesSchema

export const DialogHeaderPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(DialogHeaderOutPropertiesSchema),
)

export type DialogHeaderOutProperties = BaseOutProperties & z.output<typeof DialogHeaderOutPropertiesSchema>

export type DialogHeaderProperties = z.input<typeof DialogHeaderPropertiesSchema>

export class DialogHeader extends Container<DialogHeaderOutProperties> {
  constructor(
    inputProperties?: DialogHeaderProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogHeaderOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'column',
        gap: 6,
        ...config?.defaultOverrides,
      },
    })
  }
}
