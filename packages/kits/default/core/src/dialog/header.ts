import { Container, ThreeEventMap, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { componentDefaults } from '../theme.js'

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
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        gap: 6,
        ...config?.defaultOverrides,
      },
    })
  }
}
