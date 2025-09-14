import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  RenderContext,
} from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export type TabsListProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class TabsList<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        backgroundColor: colors.muted,
        padding: 4,
        flexShrink: 0,
        color: colors.mutedForeground,
        ...config?.defaultOverrides,
      },
    })
  }
}
