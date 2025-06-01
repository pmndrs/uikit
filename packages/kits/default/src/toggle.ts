import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  Properties,
  getProperty,
} from '@pmndrs/uikit'
import { signal, computed, Signal } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'

const toggleVariants = {
  default: {
    hover: undefined,
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
} & BaseOutProperties<EM>

export type ToggleNonReactiveProperties = {
  disabled?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  variant?: keyof typeof toggleVariants
  size?: keyof typeof toggleSizes
}

export type ToggleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  ToggleOutProperties<EM>,
  ToggleNonReactiveProperties
>

export class Toggle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ToggleOutProperties<EM>,
  ToggleNonReactiveProperties
> {
  protected internalResetProperties({
    size = 'default',
    variant = 'default',
    defaultChecked,
    disabled = false,
    onCheckedChange,
    hover,
    ...rest
  }: ToggleProperties<EM> = {}): void {
    const uncontrolled = getProperty(this, 'uncontrolled', () => computeDefaultChecked(defaultChecked))
    const checked = getProperty(this, 'checked', () => computeChecked(this.properties, uncontrolled))

    const { hover: containerHoverProps, ...containerProps } = toggleVariants[variant]

    super.internalResetProperties({
      onClick: computed(() =>
        disabled
          ? undefined
          : () => {
              if (this.properties.peek().checked == null) {
                uncontrolled.value = !checked.peek()
              }
              onCheckedChange?.(!checked.peek())
            },
      ),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      cursor: disabled ? undefined : 'pointer',
      backgroundOpacity: disabled ? 0.5 : undefined,
      borderOpacity: disabled ? 0.5 : undefined,
      backgroundColor: computed(() => (checked.value ? colors.accent.value : undefined)),
      hover: disabled ? undefined : { backgroundColor: colors.muted.value, ...containerHoverProps },
      color: computed(() => (checked.value ? colors.accentForeground.value : undefined)),
      opacity: disabled ? 0.5 : undefined,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 'medium',
      disabled,
      ...containerProps,
      ...toggleSizes[size],
      ...rest,
    })
  }
}

function computeDefaultChecked(defaultChecked?: boolean) {
  return signal(defaultChecked ?? false)
}

function computeChecked(properties: Properties<ToggleOutProperties>, uncontrolled: Signal<boolean>) {
  return computed(() => properties.value.checked ?? uncontrolled.value)
}
