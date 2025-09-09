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

export type ToggleOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  checked?: boolean
  disabled?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  variant?: keyof typeof toggleVariants
  size?: keyof typeof toggleSizes
} & BaseOutProperties<EM>

export type ToggleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<ToggleOutProperties<EM>>

export class Toggle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ToggleOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<ToggleOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ToggleOutProperties<EM>>
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
        cursor: computed(() => (this.properties.signal.disabled?.value ? undefined : 'pointer')),
        backgroundColor: computed(() => (this.getCheckedSignal().value ? colors.accent.value : undefined)),
        hover: computed(() => {
          if (this.properties.signal.disabled?.value) return undefined
          const variant = this.properties.signal.variant?.value ?? 'default'
          return { backgroundColor: toggleVariants[variant].hover?.backgroundColor?.value ?? colors.muted.value }
        }),
        color: computed(() => (this.getCheckedSignal().value ? colors.accentForeground.value : undefined)),
        opacity: computed(() => (this.properties.signal.disabled?.value ? 0.5 : undefined)),
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 'medium',
        disabled: computed(() => this.properties.signal.disabled?.value),
        borderWidth: computed(() => {
          const variant = this.properties.signal.variant?.value ?? 'default'
          return toggleVariants[variant].borderWidth
        }),
        borderColor: computed(() => {
          const variant = this.properties.signal.variant?.value ?? 'default'
          return toggleVariants[variant].borderColor?.value
        }),
        height: computed(() => {
          const size = this.properties.signal.size?.value ?? 'default'
          return toggleSizes[size].height
        }),
        paddingX: computed(() => {
          const size = this.properties.signal.size?.value ?? 'default'
          return toggleSizes[size].paddingX
        }),
        ...config?.defaultOverrides,
      } as InProperties<ToggleOutProperties<EM>>,
    })
  }

  private getUncontrolledSignal() {
    return getProperty(this, 'uncontrolled', () => signal(this.properties.peek().defaultChecked ?? false))
  }

  private getCheckedSignal() {
    const uncontrolled = this.getUncontrolledSignal()
    return getProperty(this, 'checked', () => computed(() => this.properties.value.checked ?? uncontrolled.value))
  }
}
