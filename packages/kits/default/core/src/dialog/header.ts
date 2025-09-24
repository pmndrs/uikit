import { Container, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type DialogHeaderOutProperties = BaseOutProperties

export type DialogHeaderProperties = InProperties<DialogHeaderOutProperties>

export class DialogHeader extends Container<DialogHeaderOutProperties> {
  constructor(
    inputProperties?: DialogHeaderProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogHeaderOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'column',
        gap: 6,
        ...config?.defaultOverrides,
      },
    })
  }
}
