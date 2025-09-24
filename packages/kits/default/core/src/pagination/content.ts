import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type PaginationContentProperties = InProperties<BaseOutProperties>

export class PaginationContent extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: PaginationContentProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        ...config?.defaultOverrides,
      },
    })
  }
}
