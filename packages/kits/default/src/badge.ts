import { Container, ContainerProperties, ThreeEventMap } from '@pmndrs/uikit'
import { InProperties, BaseOutProperties } from '@pmndrs/uikit/src/properties/index.js'
import { colors } from './theme.js'

const badgeVariants = {
  default: {
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
    hover: {
      backgroundOpacity: 0.8,
    },
  },
  secondary: {
    backgroundColor: colors.secondary,
    color: colors.secondaryForeground,
    hover: {
      backgroundOpacity: 0.8,
    },
  },
  destructive: {
    backgroundColor: colors.destructive,
    color: colors.destructiveForeground,
    hover: {
      backgroundOpacity: 0.8,
    },
  },
  outline: {
    hover: undefined,
  },
} satisfies Record<string, ContainerProperties>

export type BadgeNonReactiveProperties = {
  variant?: keyof typeof badgeVariants
}

export type BadgeProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  BaseOutProperties<EM>,
  BadgeNonReactiveProperties
>

export class Badge<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>,
  BadgeNonReactiveProperties
> {
  protected internalResetProperties({ variant, hover, ...rest }: BadgeProperties<EM> = {}): void {
    const { hover: variantHoverProperties, ...variantProperties } = badgeVariants[variant ?? 'default']

    super.internalResetProperties({
      borderRadius: 1000,
      borderWidth: 1,
      paddingX: 10,
      paddingY: 2,
      fontSize: 12,
      lineHeight: '16px',
      fontWeight: 'semi-bold',
      ...variantProperties,
      hover: {
        ...variantHoverProperties,
        ...hover,
      },
      ...rest,
    })
  }
}
