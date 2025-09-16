import {
  BaseOutProperties,
  Component,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  ThreeEventMap,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { theme } from '../theme.js'

type ButtonVariantProps = Pick<ContainerProperties, 'backgroundColor' | 'hover' | 'color' | 'active' | 'important'>
const _buttonVariants = {
  primary: {
    backgroundColor: theme.component.button.primary.background.fill.default,
    color: theme.component.button.primary.label.default,
    hover: {
      backgroundColor: theme.component.button.primary.background.fill.hovered,
      color: theme.component.button.primary.label.hovered,
    },
    active: {
      backgroundColor: theme.component.button.primary.background.fill.pressed,
      color: theme.component.button.primary.label.pressed,
    },
  },
  secondary: {
    backgroundColor: theme.component.button.secondary.background.fill.default,
    color: theme.component.button.secondary.label.default,
    hover: {
      backgroundColor: theme.component.button.secondary.background.fill.hovered,
      color: theme.component.button.secondary.label.hovered,
    },
    active: {
      backgroundColor: theme.component.button.secondary.background.fill.pressed,
      color: theme.component.button.secondary.label.pressed,
    },
  },
  tertiary: {
    backgroundColor: theme.component.button.tertiary.background.fill.default,
    color: theme.component.button.tertiary.label.default,
    hover: {
      backgroundColor: theme.component.button.tertiary.background.fill.hovered,
      color: theme.component.button.tertiary.label.hovered,
    },
    active: {
      backgroundColor: theme.component.button.tertiary.background.fill.pressed,
      color: theme.component.button.tertiary.label.pressed,
    },
  },
  onMedia: {
    backgroundColor: theme.component.button.onMedia.background.fill.default,
    color: theme.component.button.onMedia.label.default,
    hover: {
      backgroundColor: theme.component.button.onMedia.background.fill.hovered,
      color: theme.component.button.onMedia.label.hovered,
    },
    active: {
      backgroundColor: theme.component.button.onMedia.background.fill.pressed,
      color: theme.component.button.onMedia.label.pressed,
    },
  },
  positive: {
    backgroundColor: theme.component.button.positive.background.fill.default,
    color: theme.component.button.positive.label.default,
    hover: {
      backgroundColor: theme.component.button.positive.background.fill.hovered,
      color: theme.component.button.positive.label.hovered,
    },
    active: {
      backgroundColor: theme.component.button.positive.background.fill.pressed,
      color: theme.component.button.positive.label.pressed,
    },
  },
  negative: {
    backgroundColor: theme.component.button.negative.background.fill.default,
    color: theme.component.button.negative.label.default,
    hover: {
      backgroundColor: theme.component.button.negative.background.fill.hovered,
      color: theme.component.button.negative.label.hovered,
    },
    active: {
      backgroundColor: theme.component.button.negative.background.fill.pressed,
      color: theme.component.button.negative.label.pressed,
    },
    important: {
      backgroundColor: theme.component.button.negative.background.fill.disabled,
      color: theme.component.button.negative.label.disabled,
    },
  },
} satisfies Record<string, ButtonVariantProps>
const buttonVariants = _buttonVariants as UnionizeVariants<typeof _buttonVariants>

type ButtonSizeProps = Pick<ContainerProperties, 'height' | 'fontSize' | 'lineHeight' | 'minWidth'>
const _buttonSizes = {
  lg: {
    height: 44,
    fontSize: 14,
    lineHeight: '20px',
    minWidth: 80,
  },
  sm: {
    height: 32,
    fontSize: 12,
    lineHeight: '16px',
    minWidth: 80,
  },
} satisfies Record<string, ButtonSizeProps>
const buttonSizes = _buttonSizes as UnionizeVariants<typeof _buttonSizes>

export type ButtonOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  /**
   * @default "primary"
   */
  variant?: keyof typeof buttonVariants
  /**
   * @default "lg"
   */
  size?: keyof typeof buttonSizes
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * @default false
   */
  icon?: boolean
}

export type ButtonProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<ButtonOutProperties<EM>>

export class Button<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ButtonOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<ButtonOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ButtonOutProperties<EM>>
    },
  ) {
    const height = computed(() => buttonSizes[this.properties.value.size ?? 'lg'].height)
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        color: computed(() => buttonVariants[this.properties.value.variant ?? 'primary'].color?.value),
        backgroundColor: computed(
          () => buttonVariants[this.properties.value.variant ?? 'primary'].backgroundColor?.value,
        ),
        hover: {
          color: computed(() => buttonVariants[this.properties.value.variant ?? 'primary'].hover?.color?.value),
          backgroundColor: computed(
            () => buttonVariants[this.properties.value.variant ?? 'primary'].hover?.backgroundColor?.value,
          ),
        },
        active: {
          color: computed(() => buttonVariants[this.properties.value.variant ?? 'primary'].active?.color?.value),
          backgroundColor: computed(
            () => buttonVariants[this.properties.value.variant ?? 'primary'].active?.backgroundColor?.value,
          ),
        },
        important: {
          backgroundColor: computed(() =>
            this.properties.value.disabled === true
              ? theme.component.button.negative.background.fill.disabled.value
              : undefined,
          ),
          color: computed(() =>
            this.properties.value.disabled === true
              ? theme.component.button.negative.label.disabled.value
              : undefined,
          ),
        },
        height,
        fontSize: computed(() => buttonSizes[this.properties.value.size ?? 'lg'].fontSize),
        lineHeight: computed(() => buttonSizes[this.properties.value.size ?? 'lg'].lineHeight),
        minWidth: computed(() => buttonSizes[this.properties.value.size ?? 'lg'].minWidth),
        width: computed(() => ((this.properties.value.icon ?? false) ? height.value : undefined)),
        fontWeight: 500,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 1000,
        paddingX: 16,
        cursor: 'pointer',
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './icon.js'
export * from './label.js'
export * from './label-subtext.js'
