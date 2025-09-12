import { BaseOutProperties, Container, InProperties, ThreeEventMap, RenderContext } from '@pmndrs/uikit'

export type AlertTitleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class AlertTitle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertTitleProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        marginBottom: 4,
        padding: 0,
        paddingLeft: 28,
        fontWeight: 'medium',
        letterSpacing: -0.4,
        lineHeight: '100%',
        ...config?.defaultOverrides,
      },
    })
  }
}
