import { boolean, custom, enum as enumSchema, object, string } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { computed, signal } from '@preact/signals-core'
import { theme } from '../theme.js'
type DropdownSizeProps = { paddingX: number; paddingY: number; fontSize: number; lineHeight: `${number}px` }
const _dropdownSizes = {
  lg: {
    paddingX: 20,
    paddingY: 12,
    fontSize: 14,
    lineHeight: '20px',
  },
  sm: {
    paddingX: 16,
    paddingY: 8,
    fontSize: 12,
    lineHeight: '16px',
  },
} satisfies Record<string, DropdownSizeProps>
const dropdownSizes = _dropdownSizes as Record<keyof typeof _dropdownSizes, DropdownSizeProps>

export const DropdownOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    size: enumSchema(['lg', 'sm']).optional(),
    value: string().optional(),
    onValueChange: custom<(value?: string) => void>((value) => typeof value === 'function').optional(),
    defaultValue: string().optional(),
    open: boolean().optional(),
    onOpenChange: custom<(value?: boolean) => void>((value) => typeof value === 'function').optional(),
    defaultOpen: boolean().optional(),
  }).strict(),
)

export const DropdownPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(DropdownOutPropertiesSchema),
)

export type DropdownOutProperties = BaseOutProperties & z.output<typeof DropdownOutPropertiesSchema>

export type DropdownProperties = z.input<typeof DropdownPropertiesSchema>

export class Dropdown extends Container<DropdownOutProperties> {
  public readonly uncontrolledSignal = signal<string | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue,
  )

  public readonly uncontrolledOpenSignal = signal<boolean | undefined>(undefined)
  public readonly currentOpenSignal = computed(
    () => this.properties.value.open ?? this.uncontrolledOpenSignal.value ?? this.properties.value.defaultOpen ?? false,
  )

  constructor(
    inputProperties?: InProperties<DropdownOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        positionType: 'relative',
        cursor: 'pointer',
        borderRadius: 1000,
        fontSize: computed(() => dropdownSizes[this.properties.value.size ?? 'lg'].fontSize),
        lineHeight: computed(() => dropdownSizes[this.properties.value.size ?? 'lg'].lineHeight),
        paddingX: computed(() => dropdownSizes[this.properties.value.size ?? 'lg'].paddingX),
        paddingY: computed(() => dropdownSizes[this.properties.value.size ?? 'lg'].paddingY),
        fontWeight: 500,
        backgroundColor: theme.component.selectionDropdown.background.fill.default,
        color: theme.component.selectionDropdown.label.default,
        hover: {
          backgroundColor: theme.component.selectionDropdown.background.fill.hovered,
          color: theme.component.selectionDropdown.label.hovered,
        },
        active: {
          backgroundColor: theme.component.selectionDropdown.background.fill.pressed,
          color: theme.component.selectionDropdown.label.pressed,
        },
        important: {
          backgroundColor: computed(() =>
            this.currentSignal.value == null
              ? this.currentOpenSignal.value
                ? theme.component.selectionDropdown.background.fill.hovered.value
                : undefined
              : theme.component.selectionDropdown.background.fill.selected.value,
          ),
          color: computed(() =>
            this.currentSignal.value == null
              ? this.currentOpenSignal.value
                ? theme.component.selectionDropdown.label.hovered.value
                : undefined
              : theme.component.selectionDropdown.label.selected.value,
          ),
        },
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
    this.addEventListener('click', (e) => {
      e.stopPropagation?.()
      const newOpen = !this.currentOpenSignal.value
      this.uncontrolledOpenSignal.value = newOpen
      this.properties.peek().onOpenChange?.(newOpen)
    })
  }
}

export * from './button.js'
export * from './icon.js'
export * from './avatar.js'
export * from './list.js'
export * from './list-item.js'
export * from './text-value.js'
