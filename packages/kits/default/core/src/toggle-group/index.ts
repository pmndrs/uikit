import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import type { ToggleSize, ToggleVariant } from './item.js'
import { colors, componentDefaults } from '../theme.js'

export type ToggleGroupOutProperties = {
  variant?: ToggleVariant
  size?: ToggleSize
} & BaseOutProperties

export type ToggleGroupProperties = InProperties<ToggleGroupOutProperties>

export class ToggleGroup extends Container<ToggleGroupOutProperties> {
  constructor(
    inputProperties?: ToggleGroupProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<ToggleGroupOutProperties> },
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
        justifyContent: 'center',
        gap: 4,
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './item.js'
