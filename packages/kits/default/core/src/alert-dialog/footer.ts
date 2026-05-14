import type { z } from 'zod'
import { baseOutPropertiesSchema, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const AlertDialogFooterOutPropertiesSchema = baseOutPropertiesSchema

export const AlertDialogFooterPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(AlertDialogFooterOutPropertiesSchema),
)

export type AlertDialogFooterOutProperties = BaseOutProperties & z.output<typeof AlertDialogFooterOutPropertiesSchema>

export type AlertDialogFooterProperties = z.input<typeof AlertDialogFooterPropertiesSchema>

export class AlertDialogFooter extends Container<AlertDialogFooterOutProperties> {
  constructor(
    inputProperties?: AlertDialogFooterProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogFooterOutProperties> },
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
