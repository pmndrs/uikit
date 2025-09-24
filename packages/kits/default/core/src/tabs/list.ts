import { Container, ContainerProperties, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export type TabsListProperties = ContainerProperties

export class TabsList extends Container {
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
