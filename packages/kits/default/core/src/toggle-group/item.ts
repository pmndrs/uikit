import { boolean, custom, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext, UnionizeVariants, searchFor } from '@pmndrs/uikit'
import { computed, signal } from '@preact/signals-core'
import { borderRadius, colors, componentDefaults } from '../theme.js'
import { ToggleGroup } from './index.js'
const _toggleVariants = {
  default: {},
  outline: {
    borderWidth: 1,
    borderColor: colors.input,
    hover: {
      backgroundColor: colors.accent,
    },
  },
}
const toggleVariants = _toggleVariants as UnionizeVariants<typeof _toggleVariants>

export type ToggleVariant = keyof typeof toggleVariants

const toggleSizes = {
  default: { height: 40, paddingX: 12 },
  sm: { height: 36, paddingX: 10 },
  lg: { height: 44, paddingX: 20 },
} satisfies { [Key in string]: any }

export type ToggleSize = keyof typeof toggleSizes

export const ToggleGroupItemOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    checked: boolean().optional(),
    onCheckedChange: custom<(checked: boolean) => void>((value) => typeof value === 'function').optional(),
    disabled: boolean().optional(),
    defaultChecked: boolean().optional(),
  }).strict(),
)

export const ToggleGroupItemPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(ToggleGroupItemOutPropertiesSchema),
)

export type ToggleGroupItemOutProperties = BaseOutProperties & z.output<typeof ToggleGroupItemOutPropertiesSchema>

export type ToggleGroupItemProperties = z.input<typeof ToggleGroupItemPropertiesSchema>

export class ToggleGroupItem extends Container<ToggleGroupItemOutProperties> {
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.checked ?? this.uncontrolledSignal.value ?? this.properties.value.defaultChecked,
  )

  constructor(
    inputProperties?: ToggleGroupItemProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ToggleGroupItemOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        onClick: () => {
          if (this.properties.peek().disabled) {
            return
          }
          const isChecked = this.currentSignal.peek()
          if (this.properties.peek().checked == null) {
            this.uncontrolledSignal.value = !isChecked
          }
          this.properties.peek().onCheckedChange?.(!isChecked)
        },
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        borderWidth: computed(() => toggleVariants[this.getGroupVariant()]?.borderWidth),
        borderColor: computed(() => toggleVariants[this.getGroupVariant()]?.borderColor?.value),
        height: computed(() => toggleSizes[this.getGroupSize()].height),
        paddingX: computed(() => toggleSizes[this.getGroupSize()].paddingX),
        cursor: computed(() => (this.properties.value.disabled ? undefined : 'pointer')),
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        disabled: computed(() => this.properties.value.disabled),
        backgroundColor: computed(() => (this.currentSignal.value ? colors.accent.value : undefined)),
        hover: {
          backgroundColor: computed(() => {
            if (this.properties.value.disabled) return undefined
            const variant = this.getGroupVariant()
            return toggleVariants[variant]?.hover?.backgroundColor?.value ?? colors.muted.value
          }),
        },
        color: computed(() => (this.currentSignal.value ? colors.accentForeground.value : undefined)),
        fontSize: 14,
        lineHeight: '20px',
        ...config?.defaultOverrides,
      } as InProperties<ToggleGroupItemOutProperties>,
    })
  }

  private getGroupVariant(): keyof typeof toggleVariants {
    const toggleGroup = searchFor(this, ToggleGroup, 2)
    return toggleGroup?.properties.value.variant ?? 'default'
  }

  private getGroupSize(): keyof typeof toggleSizes {
    const toggleGroup = searchFor(this, ToggleGroup, 2)
    return toggleGroup?.properties.value.size ?? 'default'
  }
}
