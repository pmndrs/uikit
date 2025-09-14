import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  RenderContext,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { borderRadius, colors, componentDefaults } from '../theme.js'

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
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.checked ?? this.uncontrolledSignal.value ?? this.properties.value.defaultChecked,
  )

  constructor(
    inputProperties?: InProperties<ToggleOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ToggleOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
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
        cursor: computed(() => (this.properties.value.disabled ? undefined : 'pointer')),
        backgroundColor: computed(() => (this.currentSignal.value ? colors.accent.value : undefined)),
        hover: {
          backgroundColor: computed(() => {
            if (this.properties.value.disabled) return undefined
            const variant = this.properties.value.variant ?? 'default'
            return toggleVariants[variant].hover?.backgroundColor?.value ?? colors.muted.value
          }),
        },
        color: computed(() => (this.currentSignal.value ? colors.accentForeground.value : undefined)),
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 'medium',
        disabled: computed(() => this.properties.value.disabled),
        borderWidth: computed(() => {
          const variant = this.properties.value.variant ?? 'default'
          return toggleVariants[variant]?.borderWidth
        }),
        borderColor: computed(() => {
          const variant = this.properties.value.variant ?? 'default'
          return toggleVariants[variant]?.borderColor?.value
        }),
        height: computed(() => {
          const size = this.properties.value.size ?? 'default'
          return toggleSizes[size].height
        }),
        paddingX: computed(() => {
          const size = this.properties.value.size ?? 'default'
          return toggleSizes[size].paddingX
        }),
        ...config?.defaultOverrides,
      },
    })
  }
}
