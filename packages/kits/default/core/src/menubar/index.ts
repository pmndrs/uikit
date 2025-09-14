import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export class Menubar<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
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
