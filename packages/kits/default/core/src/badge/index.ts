import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
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

export type BadgeProperties = InProperties<BadgeOutProperties>

export type BadgeOutProperties = BaseOutProperties & {
  variant?: keyof typeof badgeVariants
}

export class Badge extends Container<BadgeOutProperties> {
  constructor(
    inputProperties?: InProperties<BadgeOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BadgeOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
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
