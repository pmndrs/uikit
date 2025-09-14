import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { componentDefaults } from '../theme.js'

export type PaginationProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Pagination<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        marginX: 'auto',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './content.js'
export * from './item.js'
export * from './link.js'
export * from './previous.js'
export * from './next.js'
export * from './ellipsis.js'
