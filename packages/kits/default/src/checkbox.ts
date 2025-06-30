import {
  InProperties,
  BaseOutProperties,
  Properties,
  Container,
  getProperty,
  RenderContext,
  ThreeEventMap,
} from '@pmndrs/uikit'
import { Check } from '@pmndrs/uikit-lucide'
import { signal, computed, Signal } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'

export type CheckboxOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  checked?: boolean
  disabled?: boolean
} & BaseOutProperties<EM>

export type CheckboxNonReactiveProperties = {
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export type CheckboxProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  CheckboxOutProperties<EM>,
  CheckboxNonReactiveProperties
>

export class Checkbox<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  CheckboxOutProperties<EM>,
  CheckboxNonReactiveProperties
> {
  constructor(
    inputProperties?: InProperties<CheckboxOutProperties<EM>, CheckboxNonReactiveProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext)
    const uncontrolled = getProperty(this, 'uncontrolled', () => computeDefaultChecked())
    const checked = getProperty(this, 'checked', () => computeChecked(this.properties, uncontrolled))
    super.add(
      new Check({
        color: computed(() => (checked.value ? colors.primaryForeground.value : undefined)),
        opacity: computed(() => (checked.value ? (this.properties.value.disabled ? 0.5 : undefined) : 0)),
        width: 14,
        height: 14,
      }),
    )
  }

  protected internalResetProperties({
    defaultChecked,
    disabled,
    onCheckedChange,
    ...rest
  }: CheckboxProperties<EM> = {}): void {
    const uncontrolled = getProperty(this, 'uncontrolled', () => computeDefaultChecked(defaultChecked))
    const checked = getProperty(this, 'checked', () => computeChecked(this.properties, uncontrolled))

    super.internalResetProperties({
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled ? undefined : 'pointer',
      onClick: disabled
        ? undefined
        : () => {
            if (this.properties.peek().checked == null) {
              uncontrolled.value = !checked.peek()
            }
            onCheckedChange?.(!checked.peek())
          },
      borderRadius: borderRadius.sm,
      width: 16,
      height: 16,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: computed(() => (checked.value ? colors.primary.value : undefined)),
      opacity: disabled ? 0.5 : undefined,
      disabled,
      ...rest,
    })
  }

  add(): this {
    throw new Error(`the checkbox component can not have any children`)
  }
}

function computeDefaultChecked(defaultChecked?: boolean) {
  return signal(defaultChecked ?? false)
}

function computeChecked(properties: Properties<CheckboxOutProperties>, uncontrolled: Signal<boolean>) {
  return computed(() => properties.value.checked ?? uncontrolled.value)
}
