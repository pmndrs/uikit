import { BaseOutProperties, Container, InProperties, ThreeEventMap, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type TooltipTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class TooltipTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: TooltipTriggerProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        alignSelf: 'stretch',
        ...config?.defaultOverrides,
      },
    })
  }
}
