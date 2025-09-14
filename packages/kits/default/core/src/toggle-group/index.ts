import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import type { ToggleSize, ToggleVariant } from './item.js'
import { componentDefaults } from '../theme.js'

export type ToggleGroupOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  variant?: ToggleVariant
  size?: ToggleSize
} & BaseOutProperties<EM>

export type ToggleGroupProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<ToggleGroupOutProperties<EM>>

export class ToggleGroup<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ToggleGroupOutProperties<EM>
> {
  constructor(
    inputProperties?: ToggleGroupProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<ToggleGroupOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
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
