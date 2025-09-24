import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export class Menubar extends Container {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
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
        height: 40,
        alignItems: 'center',
        gap: 4,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        backgroundColor: colors.background,
        padding: 4,
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './menu.js'
export * from './trigger.js'
