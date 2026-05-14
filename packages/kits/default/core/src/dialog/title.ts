import type { z } from 'zod'
import { baseOutPropertiesSchema, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const DialogTitleOutPropertiesSchema = baseOutPropertiesSchema

export const DialogTitlePropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(DialogTitleOutPropertiesSchema),
)

export type DialogTitleOutProperties = BaseOutProperties & z.output<typeof DialogTitleOutPropertiesSchema>

export type DialogTitleProperties = z.input<typeof DialogTitlePropertiesSchema>

export class DialogTitle extends Container<DialogTitleOutProperties> {
  constructor(
    inputProperties?: DialogTitleProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogTitleOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        fontSize: 18,
        lineHeight: '100%',
        letterSpacing: -0.4,
        fontWeight: 'semi-bold',
        ...config?.defaultOverrides,
      },
    })
  }
}
