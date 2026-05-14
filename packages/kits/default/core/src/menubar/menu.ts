import type { z } from 'zod'
import { ContainerPropertiesSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext, ContainerProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
export const MenubarMenuPropertiesSchema = ContainerPropertiesSchema

export type MenubarMenuProperties = z.input<typeof MenubarMenuPropertiesSchema>

export class MenubarMenu extends Container {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
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
        flexDirection: 'row',
        alignItems: 'center',
        ...config?.defaultOverrides,
      },
    })
  }
}
