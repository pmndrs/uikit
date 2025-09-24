import { BaseOutProperties, Container, InProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type CardFooterProperties = InProperties<BaseOutProperties>

export class CardFooter extends Container<BaseOutProperties> {
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        paddingTop: 0,
        ...config?.defaultOverrides,
      },
    })
  }
}
