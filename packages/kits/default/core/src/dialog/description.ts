import { Container, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type DialogDescriptionOutProperties = BaseOutProperties

export type DialogDescriptionProperties = InProperties<DialogDescriptionOutProperties>

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
