import { Container, ThreeEventMap, InProperties, BaseOutProperties, WithSignal, RenderContext } from '@pmndrs/uikit'
import { componentDefaults } from '../theme.js'

export type PaginationItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class PaginationItem<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties<EM>>
      defaults?: WithSignal<BaseOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, { defaults: componentDefaults, ...config })
  }
}
