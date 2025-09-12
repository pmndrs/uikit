import { Container, ThreeEventMap, InProperties, BaseOutProperties } from '@pmndrs/uikit'

export type DialogTitleOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DialogTitleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<DialogTitleOutProperties<EM>>

export class DialogTitle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogTitleOutProperties<EM>
> {
  constructor(
    inputProperties?: DialogTitleProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogTitleOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        fontSize: 18,
        lineHeight: '100%',
        letterSpacing: -0.4,
        fontWeight: 'semi-bold',
        ...config?.defaultOverrides,
      },
    })
  }
}
