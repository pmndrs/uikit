import { Container, ThreeEventMap, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { componentDefaults } from '../theme.js'

export type DialogFooterOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DialogFooterProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DialogFooterOutProperties<EM>
>

export class DialogFooter<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogFooterOutProperties<EM>
> {
  constructor(
    inputProperties?: DialogFooterProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogFooterOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
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
