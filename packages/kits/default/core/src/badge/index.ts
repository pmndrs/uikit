import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  ThreeEventMap,
  withOpacity,
  RenderContext,
} from '@pmndrs/uikit'
import { colors } from '../theme.js'
import { computed } from '@preact/signals-core'

type BadgeVariantProps = Pick<ContainerProperties, 'hover' | 'backgroundColor' | 'color'>

const badgeVariants: Record<string, BadgeVariantProps> = {
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
  outline: {
    hover: undefined,
  },
}

export type BadgeProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BadgeOutProperties<EM>>

export type BadgeOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  variant?: keyof typeof badgeVariants
}

export class Badge<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends BadgeOutProperties<EM> = BadgeOutProperties<EM>,
> extends Container<T, EM, BadgeOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        borderRadius: 1000,
        paddingX: 10,
        paddingY: 2,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 'semi-bold',
        backgroundColor: computed(
          () => badgeVariants[this.properties.signal.variant.value ?? 'default']?.backgroundColor,
        ),
        color: computed(() => badgeVariants[this.properties.signal.variant.value ?? 'default']?.color),
        hover: {
          backgroundColor: computed(
            () => badgeVariants[this.properties.signal.variant.value ?? 'default']?.hover?.backgroundColor,
          ),
        },
        borderWidth: 1,
        ...config?.defaultOverrides,
      } as InProperties<OutProperties>,
    })
  }
}
