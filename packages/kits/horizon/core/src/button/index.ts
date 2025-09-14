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
import { lightTheme } from '../theme.js'

type ButtonVariantProps = Pick<ContainerProperties, 'backgroundColor' | 'hover' | 'color'>
const _buttonVariants = {
  primary: {
    backgroundColor: lightTheme.component.button.primary.background.fill.default,
    color: lightTheme.component.button.primary.label.default,
    hover: {
      backgroundColor: lightTheme.component.button.primary.background.fill.hovered,
      color: lightTheme.component.button.primary.label.hovered,
    },
  },
  secondary: {
    backgroundColor: lightTheme.component.button.secondary.background.fill.default,
    color: lightTheme.component.button.secondary.label.default,
    hover: {
      backgroundColor: lightTheme.component.button.secondary.background.fill.hovered,
      color: lightTheme.component.button.secondary.label.hovered,
    },
  },
  tertiary: {
    backgroundColor: lightTheme.component.button.tertiary.background.fill.default,
    color: lightTheme.component.button.tertiary.label.default,
    hover: {
      backgroundColor: lightTheme.component.button.tertiary.background.fill.hovered,
      color: lightTheme.component.button.tertiary.label.hovered,
    },
  },
  onMedia: {
    backgroundColor: lightTheme.component.button.onMedia.background.fill.default,
    color: lightTheme.component.button.onMedia.label.default,
    hover: {
      backgroundColor: lightTheme.component.button.onMedia.background.fill.hovered,
      color: lightTheme.component.button.onMedia.label.hovered,
    },
  },
  positive: {
    backgroundColor: lightTheme.component.button.positive.background.fill.default,
    color: lightTheme.component.button.positive.label.default,
    hover: {
      backgroundColor: lightTheme.component.button.positive.background.fill.hovered,
      color: lightTheme.component.button.positive.label.hovered,
    },
  },
  negative: {
    backgroundColor: lightTheme.component.button.negative.background.fill.default,
    color: lightTheme.component.button.negative.label.default,
    hover: {
      backgroundColor: lightTheme.component.button.negative.background.fill.hovered,
      color: lightTheme.component.button.negative.label.hovered,
    },
  },
} satisfies Record<string, ButtonVariantProps>
const buttonVariants = _buttonVariants as UnionizeVariants<typeof _buttonVariants>

type ButtonSizeProps = Pick<ContainerProperties, 'height' | 'fontSize' | 'lineHeight' | 'minWidth'>
const _buttonSizes = {
  md: {
    height: 44,
    fontSize: 16,
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
   * @default "md"
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
    const height = computed(() => buttonSizes[this.properties.value.size ?? 'md'].height)
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
        height,
        fontSize: computed(() => buttonSizes[this.properties.value.size ?? 'md'].fontSize),
        lineHeight: computed(() => buttonSizes[this.properties.value.size ?? 'md'].lineHeight),
        minWidth: computed(() => buttonSizes[this.properties.value.size ?? 'md'].minWidth),
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

export function getButtonIconProperties(getIcon: () => Component) {
  const size = computed(() => {
    const btn = getIcon().parentContainer.value
    if (!(btn instanceof Button)) {
      return 24
    }
    const size = btn.properties.value.size ?? 'md'
    if (size === 'md') {
      return 24
    }
    return 16
  })
  return {
    width: size,
    height: size,
  }
}
