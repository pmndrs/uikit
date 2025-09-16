import { BaseOutProperties, Container, InProperties, ThreeEventMap } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export type CardProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Card<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, BaseOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
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
