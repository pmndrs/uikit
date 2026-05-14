import type { z } from 'zod'
import { ContainerPropertiesSchema } from '@pmndrs/uikit'
import { Container, ContainerProperties, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'
export const MenubarTriggerPropertiesSchema = ContainerPropertiesSchema

export type MenubarTriggerProperties = z.input<typeof MenubarTriggerPropertiesSchema>

export class MenubarTrigger extends Container {
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
        hover: { backgroundColor: colors.accent },
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: borderRadius.md,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 12,
        paddingRight: 12,
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 'medium',
        ...config?.defaultOverrides,
      },
    })
  }
}
