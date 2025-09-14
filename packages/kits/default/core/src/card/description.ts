import { BaseOutProperties, Container, InProperties, ThreeEventMap } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type CardDescriptionProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class CardDescription<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        fontSize: 14,
        lineHeight: '20px',
        color: colors.mutedForeground,
        ...config?.defaultOverrides,
      },
    })
  }
}
