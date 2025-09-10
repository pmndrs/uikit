import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'

export type AlertDialogFooterOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogFooterProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogFooterOutProperties<EM>
>

export class AlertDialogFooter<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogFooterOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogFooterProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogFooterOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column-reverse',
        sm: { flexDirection: 'row', justifyContent: 'flex-end' },
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
  }
}



