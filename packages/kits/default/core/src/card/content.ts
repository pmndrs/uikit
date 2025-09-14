import { BaseOutProperties, Container, InProperties, ThreeEventMap } from '@pmndrs/uikit'
import { componentDefaults } from '../theme.js'

export type CardContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class CardContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
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
        padding: 24,
        paddingTop: 0,
        ...config?.defaultOverrides,
      },
    })
  }
}
