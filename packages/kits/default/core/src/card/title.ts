import type { z } from 'zod'
import { ContainerPropertiesSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const CardTitlePropertiesSchema = ContainerPropertiesSchema

export type CardTitleProperties = z.input<typeof CardTitlePropertiesSchema>

export class CardTitle extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<BaseOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        fontWeight: 'semi-bold',
        letterSpacing: -0.4,
        fontSize: 24,
        lineHeight: '100%',
        ...config?.defaultOverrides,
      },
    })
  }
}
