import type { z } from 'zod'
import { baseOutPropertiesSchema, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const AlertDialogDescriptionOutPropertiesSchema = baseOutPropertiesSchema

export const AlertDialogDescriptionPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(AlertDialogDescriptionOutPropertiesSchema),
)

export type AlertDialogDescriptionOutProperties = BaseOutProperties &
  z.output<typeof AlertDialogDescriptionOutPropertiesSchema>

export type AlertDialogDescriptionProperties = z.input<typeof AlertDialogDescriptionPropertiesSchema>

export class AlertDialogDescription extends Container<AlertDialogDescriptionOutProperties> {
  constructor(
    inputProperties?: AlertDialogDescriptionProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AlertDialogDescriptionOutProperties>
    },
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
