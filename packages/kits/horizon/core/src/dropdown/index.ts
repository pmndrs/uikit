import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  ThreeEventMap,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { computed, signal } from '@preact/signals-core'
import { theme } from '../theme.js'

type DropdownSizeProps = Pick<ContainerProperties, 'paddingX' | 'paddingY' | 'fontSize' | 'lineHeight'>
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
const dropdownSizes = _dropdownSizes as UnionizeVariants<typeof _dropdownSizes>

export type DropdownOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  /**
   * @default "lg"
   */
  size?: keyof typeof dropdownSizes
  value?: string
  onValueChange?: (value?: string) => void
  defaultValue?: string

  open?: boolean
  onOpenChange?: (value?: boolean) => void
  defaultOpen?: string
}

export type DropdownProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<DropdownOutProperties<EM>>

export class Dropdown<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DropdownOutProperties<EM>
> {
  public readonly uncontrolledSignal = signal<string | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue,
  )

  public readonly uncontrolledOpenSignal = signal<boolean | undefined>(undefined)
  public readonly currentOpenSignal = computed(
    () => this.properties.value.open ?? this.uncontrolledOpenSignal.value ?? this.properties.value.defaultOpen ?? false,
  )

  constructor(
    inputProperties?: InProperties<DropdownOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownOutProperties<EM>>
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
