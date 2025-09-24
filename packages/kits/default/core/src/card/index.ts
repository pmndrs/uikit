import { BaseOutProperties, Container, InProperties } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export type CardProperties = InProperties<BaseOutProperties>

export class Card extends Container<BaseOutProperties> {
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
        flexDirection: 'column',
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        backgroundColor: colors.card,
        color: colors.cardForeground,
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './header.js'
export * from './title.js'
export * from './description.js'
export * from './content.js'
export * from './footer.js'
