import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors } from '../theme.js'

export type AlertDialogContentOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogContentOutProperties<EM>
>

export class AlertDialogContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogContentOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogContentProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogContentOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        onClick: (e) => {
          e.stopPropagation?.()
        },
        positionType: 'relative',
        flexDirection: 'column',
        maxWidth: 512,
        width: '100%',
        gap: 16,
        borderWidth: 1,
        backgroundColor: colors.background,
        padding: 24,
        sm: { borderRadius: borderRadius.lg },
        ...config?.defaultOverrides,
      },
    })
  }
}
