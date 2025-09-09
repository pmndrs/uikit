import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  getProperty,
  RenderContext,
} from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'

const toggleVariants = {
  default: {
    hover: undefined,
    borderWidth: undefined,
    borderColor: undefined,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.input,
    hover: {
      backgroundColor: colors.accent,
    },
  },
}
const toggleSizes = {
  default: { height: 40, paddingX: 12 },
  sm: { height: 36, paddingX: 10 },
  lg: { height: 44, paddingX: 20 },
} satisfies { [Key in string]: ContainerProperties }

export type ToggleGroupOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  variant?: keyof typeof toggleVariants
  size?: keyof typeof toggleSizes
} & BaseOutProperties<EM>

export type ToggleGroupProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<ToggleGroupOutProperties<EM>>

export class ToggleGroup<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ToggleGroupOutProperties<EM>
> {
  constructor(
    inputProperties?: ToggleGroupProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<ToggleGroupOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        ...config?.defaultOverrides,
      },
    })
  }
}
export type ToggleGroupItemOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  defaultChecked?: boolean
} & BaseOutProperties<EM>

export type ToggleGroupItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  ToggleGroupItemOutProperties<EM>
>

export class ToggleGroupItem<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ToggleGroupItemOutProperties<EM>
> {
  constructor(
    inputProperties?: ToggleGroupItemProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ToggleGroupItemOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        onClick: () => {
          if (this.properties.peek().disabled) {
            return
          }
          const isChecked = this.getCheckedSignal().peek()
          if (this.properties.peek().checked == null) {
            this.getUncontrolledSignal().value = !isChecked
          }
          this.properties.peek().onCheckedChange?.(!isChecked)
        },
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
        borderWidth: computed(() => toggleVariants[this.getGroupVariant()].borderWidth),
        borderColor: computed(() => toggleVariants[this.getGroupVariant()].borderColor?.value),
        height: computed(() => toggleSizes[this.getGroupSize()].height),
        paddingX: computed(() => toggleSizes[this.getGroupSize()].paddingX),
        cursor: computed(() => (this.properties.signal.disabled?.value ? undefined : 'pointer')),
        opacity: computed(() => (this.properties.signal.disabled?.value ? 0.5 : undefined)),
        disabled: computed(() => this.properties.signal.disabled?.value),
        backgroundColor: computed(() => (this.getCheckedSignal().value ? colors.accent.value : undefined)),
        hover: computed(() => {
          if (this.properties.signal.disabled?.value) return undefined
          const variant = this.getGroupVariant()
          return { backgroundColor: toggleVariants[variant].hover?.backgroundColor?.value ?? colors.muted.value }
        }),
        color: computed(() => (this.getCheckedSignal().value ? colors.accentForeground.value : undefined)),
        fontSize: 14,
        lineHeight: '20px',
        ...config?.defaultOverrides,
      } as InProperties<ToggleGroupItemOutProperties<EM>>,
    })
  }

  private getUncontrolledSignal() {
    return getProperty(this, 'uncontrolled', () => signal(this.properties.peek().defaultChecked ?? false))
  }

  private getCheckedSignal() {
    const uncontrolled = this.getUncontrolledSignal()
    return getProperty(this, 'checked', () => computed(() => this.properties.value.checked ?? uncontrolled.value))
  }

  private getGroupVariant(): keyof typeof toggleVariants {
    const parent = this.parentContainer.value
    const variant = parent instanceof ToggleGroup ? parent.properties.value.variant : undefined
    return (variant ?? 'default') as keyof typeof toggleVariants
  }

  private getGroupSize(): keyof typeof toggleSizes {
    const parent = this.parentContainer.value
    const size = parent instanceof ToggleGroup ? parent.properties.value.size : undefined
    return (size ?? 'default') as keyof typeof toggleSizes
  }
}
