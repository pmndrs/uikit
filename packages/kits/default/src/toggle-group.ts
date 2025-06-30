import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  getProperty,
  Properties,
} from '@pmndrs/uikit'
import { signal, computed, Signal } from '@preact/signals-core'
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
  protected internalResetProperties(props: ToggleGroupProperties<EM> = {}): void {
    super.internalResetProperties({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      ...props,
    })
  }
}

export type ToggleGroupItemOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
} & BaseOutProperties<EM>

export type ToggleGroupItemNonReactiveProperties = {
  disabled?: boolean
  defaultChecked?: boolean
}

export type ToggleGroupItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  ToggleGroupItemOutProperties<EM>,
  ToggleGroupItemNonReactiveProperties
>

export class ToggleGroupItem<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ToggleGroupItemOutProperties<EM>,
  ToggleGroupItemNonReactiveProperties
> {
  protected internalResetProperties({
    defaultChecked,
    disabled = false,
    hover,
    ...rest
  }: ToggleGroupItemProperties<EM> = {}): void {
    const uncontrolled = getProperty(this, 'uncontrolled', () => computeDefaultChecked(defaultChecked))
    const checked = getProperty(this, 'checked', () => computeChecked(this.properties, uncontrolled))

    // Get parent ToggleGroup using parentContainer pattern from radio-group
    const toggleGroupProperties = computed(() =>
      this.parentContainer.value instanceof ToggleGroup ? this.parentContainer.value.properties.value : undefined,
    )

    const size = computed(() => toggleGroupProperties.value?.size ?? 'default')
    const variant = computed(() => toggleGroupProperties.value?.variant ?? 'default')

    //all the properties extracted from toggleVariants and toggleSizes
    const hoverBackgroundColor = computed(
      () => toggleVariants[variant.value].hover?.backgroundColor.value ?? colors.muted.value,
    )
    const borderWidth = computed(() => toggleVariants[variant.value].borderWidth)
    const borderColor = computed(() => toggleVariants[variant.value].borderColor?.value)
    const height = computed(() => toggleSizes[size.value].height)
    const paddingX = computed(() => toggleSizes[size.value].paddingX)

    super.internalResetProperties({
      onClick: computed(() =>
        disabled
          ? undefined
          : () => {
              if (this.properties.peek().checked == null) {
                uncontrolled.value = !checked.peek()
              }
              this.properties.peek().onCheckedChange?.(!checked.peek())
            },
      ),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      borderWidth,
      borderColor,
      height,
      paddingX,
      cursor: computed(() => (disabled ? undefined : 'pointer')),
      opacity: computed(() => (disabled ? 0.5 : undefined)),
      backgroundColor: computed(() => (checked.value ? colors.accent.value : undefined)),
      hover: disabled
        ? hover
        : {
            backgroundColor: hoverBackgroundColor,
            ...hover,
          },
      color: computed(() => (checked.value ? colors.accentForeground.value : undefined)),
      fontSize: 14,
      lineHeight: '20px',
      ...rest,
    })
  }
}

function computeDefaultChecked(defaultChecked?: boolean) {
  return signal(defaultChecked ?? false)
}

function computeChecked(properties: Properties<ToggleGroupItemOutProperties>, uncontrolled: Signal<boolean>) {
  return computed(() => properties.value.checked ?? uncontrolled.value)
}
