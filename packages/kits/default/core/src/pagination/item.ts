import { Container, InProperties, BaseOutProperties, WithSignal, RenderContext } from '@pmndrs/uikit'
import { componentDefaults } from '../theme.js'

export type PaginationItemProperties = InProperties<BaseOutProperties>

export class PaginationItem extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties>
      defaults?: WithSignal<BaseOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, { defaults: componentDefaults, ...config })
  }
}
