import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type TooltipTriggerProperties = InProperties<BaseOutProperties>

export class TooltipTrigger extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: TooltipTriggerProperties,
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
        alignSelf: 'stretch',
        ...config?.defaultOverrides,
      },
    })
  }
}
