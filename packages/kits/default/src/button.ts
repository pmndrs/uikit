import { Container, ContainerProperties, ThreeEventMap } from '@pmndrs/uikit'
import { borderRadius, colors } from './theme.js'
import { InProperties, BaseOutProperties } from '@pmndrs/uikit/src/properties/index.js'
import { computed } from '@preact/signals-core'
import { readReactive } from '@pmndrs/uikit/src/utils.js'

const buttonVariants = {
  default: {
    hover: {
      backgroundOpacity: 0.9,
    },
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
  },
  destructive: {
    hover: {
      backgroundOpacity: 0.9,
    },
    backgroundColor: colors.destructive,
    color: colors.destructiveForeground,
  },
  outline: {
    hover: {
      backgroundColor: colors.accent,
      color: colors.accentForeground,
    },
    borderWidth: 1,
    borderColor: colors.input,
    backgroundColor: colors.background,
  },
  secondary: {
    hover: {
      backgroundOpacity: 0.8,
      color: colors.accentForeground,
    },
    backgroundColor: colors.secondary,
    color: colors.secondaryForeground,
  },
  ghost: {
    hover: undefined,
    backgroundColor: colors.accent,
  },
  link: {
    hover: undefined,
    color: colors.primary,
  }, //TODO: underline-offset-4 hover:underline",
} satisfies Record<string, ContainerProperties>

const buttonSizes = {
  default: { height: 40, paddingX: 16, paddingY: 8 },
  sm: { height: 36, paddingX: 12 },
  lg: { height: 42, paddingX: 32 },
  icon: { height: 40, width: 40 },
} satisfies { [Key in string]: ContainerProperties }

export type ButtonNonReactiveProperties = {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  disabled?: boolean
}

export type ButtonProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  BaseOutProperties<EM>,
  ButtonNonReactiveProperties
>

export class Button<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>,
  ButtonNonReactiveProperties
> {
  resetProperties({ hover, variant, size, disabled, ...rest }: ButtonProperties<EM> = {}): void {
    const { hover: variantHoverProperties, ...variantProperties } = buttonVariants[variant ?? 'default']
    const sizeProperties = buttonSizes[size ?? 'default']
    super.resetProperties({
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...variantProperties,
      ...sizeProperties,
      borderOpacity: computed(() => (readReactive(disabled) ? 0.5 : undefined)),
      backgroundOpacity: computed(() => (readReactive(disabled) ? 0.5 : undefined)),
      cursor: computed(() => (readReactive(disabled) ? undefined : 'pointer')),
      flexDirection: 'row',
      hover: {
        ...variantHoverProperties,
        ...hover,
      },
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 'medium',
      wordBreak: 'keep-all',
      opacity: computed(() => (readReactive(disabled) ? 0.5 : undefined)),
      ...rest,
    })
  }
}
