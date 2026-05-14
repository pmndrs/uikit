import type { z } from 'zod'
import { baseOutPropertiesSchema, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const DialogFooterOutPropertiesSchema = baseOutPropertiesSchema

export const DialogFooterPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(DialogFooterOutPropertiesSchema),
)

export type DialogFooterOutProperties = BaseOutProperties & z.output<typeof DialogFooterOutPropertiesSchema>

export type DialogFooterProperties = z.input<typeof DialogFooterPropertiesSchema>

export class DialogFooter extends Container<DialogFooterOutProperties> {
  constructor(
    inputProperties?: DialogFooterProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogFooterOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'column-reverse',
        sm: { flexDirection: 'row', justifyContent: 'flex-end' },
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
  }
}
