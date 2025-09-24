import { Container, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type DialogTitleOutProperties = BaseOutProperties

export type DialogTitleProperties = InProperties<DialogTitleOutProperties>

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
