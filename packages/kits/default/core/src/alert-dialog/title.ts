import type { z } from 'zod'
import { baseOutPropertiesSchema, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const AlertDialogTitleOutPropertiesSchema = baseOutPropertiesSchema

export const AlertDialogTitlePropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(AlertDialogTitleOutPropertiesSchema),
)

export type AlertDialogTitleOutProperties = BaseOutProperties & z.output<typeof AlertDialogTitleOutPropertiesSchema>

export type AlertDialogTitleProperties = z.input<typeof AlertDialogTitlePropertiesSchema>

export class AlertDialogTitle extends Container<AlertDialogTitleOutProperties> {
  constructor(
    inputProperties?: AlertDialogTitleProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogTitleOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        fontSize: 18,
        lineHeight: '28px',
        fontWeight: 'semi-bold',
        ...config?.defaultOverrides,
      },
    })
  }
}
