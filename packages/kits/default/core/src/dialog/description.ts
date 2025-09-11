import { Container, ThreeEventMap, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { colors } from '../theme.js'

export type DialogDescriptionOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DialogDescriptionProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DialogDescriptionOutProperties<EM>
>

export class DialogDescription<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogDescriptionOutProperties<EM>
> {
  constructor(
    inputProperties?: DialogDescriptionProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogDescriptionOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
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
