import { BaseOutProperties, Container, InProperties, ThreeEventMap } from '@pmndrs/uikit'

export type CardTitleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class CardTitle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
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
      ...config,
      defaultOverrides: {
        fontWeight: 'semi-bold',
        letterSpacing: -0.4,
        fontSize: 24,
        lineHeight: '100%',
        ...config?.defaultOverrides,
      },
    })
  }
}
