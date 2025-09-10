import { Container, ThreeEventMap, InProperties, BaseOutProperties } from '@pmndrs/uikit'

export type DialogHeaderOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DialogHeaderProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DialogHeaderOutProperties<EM>
>

export class DialogHeader<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogHeaderOutProperties<EM>
> {
  constructor(
    inputProperties?: DialogHeaderProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogHeaderOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        gap: 6,
        ...config?.defaultOverrides,
      },
    })
  }
}



