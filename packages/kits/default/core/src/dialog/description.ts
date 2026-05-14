import type { z } from 'zod'
import { baseOutPropertiesSchema, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const DialogDescriptionOutPropertiesSchema = baseOutPropertiesSchema

export const DialogDescriptionPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(DialogDescriptionOutPropertiesSchema),
)

export type DialogDescriptionOutProperties = BaseOutProperties & z.output<typeof DialogDescriptionOutPropertiesSchema>

export type DialogDescriptionProperties = z.input<typeof DialogDescriptionPropertiesSchema>

export class DialogDescription extends Container<DialogDescriptionOutProperties> {
  constructor(
    inputProperties?: DialogDescriptionProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogDescriptionOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        fontSize: 14,
        lineHeight: '20px',
        color: colors.mutedForeground,
        ...config?.defaultOverrides,
      },
    })
  }
}
