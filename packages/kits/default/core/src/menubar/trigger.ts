import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  RenderContext,
} from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export type MenubarTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class MenubarTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
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
        hover: { backgroundColor: colors.accent },
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
        borderRadius: borderRadius.md,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 12,
        paddingRight: 12,
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 'medium',
        ...config?.defaultOverrides,
      },
    })
  }
}
