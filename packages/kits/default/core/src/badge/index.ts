import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  ThreeEventMap,
  withOpacity,
  RenderContext,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
import { computed } from '@preact/signals-core'

type BadgeVariantProps = Pick<ContainerProperties, 'hover' | 'backgroundColor' | 'color'>

const _badgeVariants = {
  default: {
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    hover: {
      backgroundColor: withOpacity(colors.primary, 0.8),
    },
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.secondaryForeground,
    hover: {
      backgroundColor: withOpacity(colors.secondary, 0.8),
    },
  },
  destructive: {
    backgroundColor: colors.destructive,
    color: colors.destructiveForeground,
    hover: {
      backgroundColor: withOpacity(colors.destructive, 0.8),
    },
  },
  outline: {},
} satisfies Record<string, BadgeVariantProps>

const badgeVariants = _badgeVariants as UnionizeVariants<typeof _badgeVariants>

export type BadgeProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BadgeOutProperties<EM>>

export type BadgeOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  variant?: keyof typeof badgeVariants
}

export class Badge<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, BadgeOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<BadgeOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BadgeOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        borderRadius: 1000,
        paddingX: 10,
        paddingY: 2,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 'semi-bold',
        backgroundColor: computed(
          () => badgeVariants[this.properties.value.variant ?? 'default'].backgroundColor?.value,
        ),
        color: computed(() => badgeVariants[this.properties.value.variant ?? 'default'].color?.value),
        hover: {
          backgroundColor: computed(
            () => badgeVariants[this.properties.value.variant ?? 'default'].hover?.backgroundColor?.value,
          ),
        },
        borderWidth: 1,
        ...config?.defaultOverrides,
      },
    })
  }
}
