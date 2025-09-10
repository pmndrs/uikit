import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  ThreeEventMap,
  withOpacity,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors } from '../theme.js'

type ButtonVariantProps = Pick<
  ContainerProperties,
  'hover' | 'backgroundColor' | 'color' | 'borderWidth' | 'borderColor'
>
type ButtonSizeProps = Pick<ContainerProperties, 'height' | 'width' | 'paddingX' | 'paddingY'>

const buttonVariants: Record<string, ButtonVariantProps> = {
  default: {
    hover: {
      backgroundColor: withOpacity(colors.primary, 0.9),
    },
    backgroundColor: colors.primary,
    color: colors.primaryForeground,
  },
  destructive: {
    hover: {
      backgroundColor: withOpacity(colors.destructive, 0.9),
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
      backgroundColor: withOpacity(colors.secondary, 0.8),
    },
    backgroundColor: colors.secondary,
    color: colors.secondaryForeground,
  },
  ghost: {
    hover: {
      backgroundColor: colors.accent,
      color: colors.accentForeground,
    },
  },
  link: {
    hover: undefined,
    color: colors.primary,
  }, //TODO: underline-offset-4 hover:underline",
}

const buttonSizes: Record<string, ButtonSizeProps> = {
  default: { height: 40, paddingX: 16, paddingY: 8 },
  sm: { height: 36, paddingX: 12 },
  lg: { height: 42, paddingX: 32 },
  icon: { height: 40, width: 40 },
}

export type ButtonOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  disabled?: boolean
}

export type ButtonProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<ButtonOutProperties<EM>>

export class Button<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends ButtonOutProperties<EM> = ButtonOutProperties<EM>,
> extends Container<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    const borderW = computed(() => {
      const variant = this.properties.signal.variant?.value ?? 'default'
      return buttonVariants[variant]?.borderWidth
    })
    const sizeProps = computed(() => {
      const size = this.properties.signal.size?.value ?? 'default'
      return buttonSizes[size]
    })
    const paddingX = computed(() => sizeProps.value?.paddingX)
    const paddingY = computed(() => sizeProps.value?.paddingY)
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 'medium',
        wordBreak: 'keep-all',
        hover: {
          backgroundColor: computed(
            () => buttonVariants[this.properties.signal.variant?.value ?? 'default']?.hover?.backgroundColor,
          ),
          color: computed(() => buttonVariants[this.properties.signal.variant?.value ?? 'default']?.hover?.color),
        },
        backgroundColor: computed(
          () => buttonVariants[this.properties.signal.variant?.value ?? 'default']?.backgroundColor,
        ),
        color: computed(() => buttonVariants[this.properties.signal.variant?.value ?? 'default']?.color),
        borderTopWidth: borderW,
        borderRightWidth: borderW,
        borderBottomWidth: borderW,
        borderLeftWidth: borderW,
        borderColor: computed(() => buttonVariants[this.properties.signal.variant?.value ?? 'default']?.borderColor),
        // size-derived
        height: computed(() => sizeProps.value?.height),
        width: computed(() => sizeProps.value?.width),
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        // disabled-derived
        opacity: computed(() => ((this.properties.signal.disabled?.value ?? false) ? 0.5 : 1)),
        cursor: computed(() => ((this.properties.signal.disabled?.value ?? false) ? 'default' : 'pointer')),
        ...config?.defaultOverrides,
      } as InProperties<OutProperties>,
    })
  }
}
