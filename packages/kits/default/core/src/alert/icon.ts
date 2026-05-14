import type { z } from 'zod'
import { ContainerPropertiesSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const AlertIconPropertiesSchema = ContainerPropertiesSchema

export type AlertIconProperties = z.input<typeof AlertIconPropertiesSchema>

export class AlertIcon extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: AlertIconProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        positionLeft: 16,
        positionTop: 16,
        positionType: 'absolute',
        ...config?.defaultOverrides,
      },
    })
  }
}
