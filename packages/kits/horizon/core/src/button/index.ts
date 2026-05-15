import { boolean, enum as enumSchema, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import {
  BaseOutProperties,
  Component,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
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

type ButtonSizeProps = { height: number; fontSize: number; lineHeight: `${number}px`; minWidth: number }
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
const buttonSizes = _buttonSizes as Record<keyof typeof _buttonSizes, ButtonSizeProps>

export const ButtonOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    variant: enumSchema(
      Object.keys(buttonVariants) as [keyof typeof buttonVariants, ...(keyof typeof buttonVariants)[]],
    ).optional(),
    size: enumSchema(
      Object.keys(buttonSizes) as [keyof typeof buttonSizes, ...(keyof typeof buttonSizes)[]],
    ).optional(),
    disabled: boolean().optional(),
    icon: boolean().optional(),
  }).strict(),
)

export const ButtonPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(ButtonOutPropertiesSchema),
)

export type ButtonOutProperties = BaseOutProperties & z.output<typeof ButtonOutPropertiesSchema>

export type ButtonProperties = z.input<typeof ButtonPropertiesSchema>

export class Button extends Container<ButtonOutProperties> {
  constructor(
    inputProperties?: InProperties<ButtonOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ButtonOutProperties>
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
            this.properties.value.disabled === true ? theme.component.button.negative.label.disabled.value : undefined,
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
