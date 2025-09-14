import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { componentDefaults } from '../theme.js'

export type AlertDialogTitleOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogTitleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogTitleOutProperties<EM>
>

export class AlertDialogTitle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogTitleOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogTitleProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogTitleOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        fontSize: 18,
        lineHeight: '28px',
        fontWeight: 'semi-bold',
        ...config?.defaultOverrides,
      },
    })
  }
}
