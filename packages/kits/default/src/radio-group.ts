import {
  Container,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  Properties,
  getProperty,
  RenderContext,
} from '@pmndrs/uikit'
import { signal, computed, Signal } from '@preact/signals-core'
import { colors } from './theme.js'

export type RadioGroupOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  value?: string
  onValueChange?: (value?: string) => void
  defaultValue?: string
} & BaseOutProperties<EM>

export type RadioGroupProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<RadioGroupOutProperties<EM>>

export class RadioGroup<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  RadioGroupOutProperties<EM>
> {
  protected internalResetProperties(props: RadioGroupProperties<EM> = {}): void {
    super.internalResetProperties({
      flexDirection: 'column',
      gap: 8,
      ...props,
    })
  }

  getUncontrolledSignal() {
    return getProperty(this, 'uncontrolled', () => computeDefaultValue(this.properties.peek().defaultValue))
  }

  getCurrentValueSignal() {
    return getProperty(this, 'currentValue', () => computeCurrentValue(this.properties, this.getUncontrolledSignal()))
  }
}

export type RadioGroupItemOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  disabled?: boolean
  value?: string
} & BaseOutProperties<EM>

export type RadioGroupItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  RadioGroupItemOutProperties<EM>
>

export class RadioGroupItem<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  RadioGroupItemOutProperties<EM>
> {
  constructor(
    inputProperties?: RadioGroupItemProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext)
    const isSelected = computed(
      () =>
        this.parentContainer.value instanceof RadioGroup &&
        this.parentContainer.value.getCurrentValueSignal().value === this.properties.value.value,
    )

    // Create radio button and dot in constructor with their properties
    const radioButton = new Container({
      aspectRatio: 1,
      height: 16,
      width: 16,
      borderRadius: 1000,
      borderWidth: 1,
      borderColor: colors.primary,
      opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
      alignItems: 'center',
      justifyContent: 'center',
    })
    const radioDot = new Container({
      borderRadius: 1000,
      aspectRatio: 1,
      backgroundColor: colors.primary,
      height: 9,
      width: 9,
    })

    // Add radio dot to radio button and radio button to this item
    radioButton.add(radioDot)
    super.add(radioButton)
  }

  protected internalResetProperties({ disabled = false, ...rest }: RadioGroupItemProperties<EM> = {}): void {
    super.internalResetProperties({
      cursor: disabled ? undefined : 'pointer',
      onClick: computed(() =>
        disabled
          ? undefined
          : () => {
              const radioGroup = this.parentContainer.peek()
              if (!(radioGroup instanceof RadioGroup)) {
                return
              }
              const value = this.properties.peek().value
              if (radioGroup.properties.peek().value == null) {
                radioGroup.getUncontrolledSignal().value = value
              }
              radioGroup.properties.peek().onValueChange?.(value)
            },
      ),
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      disabled,
      ...rest,
    })
  }

  add(): this {
    throw new Error(`the radio group item component can not have any children`)
  }
}

function computeDefaultValue(defaultValue: string | undefined) {
  return signal<string | undefined>(defaultValue)
}

function computeCurrentValue(
  properties: Properties<RadioGroupOutProperties>,
  uncontrolled: Signal<string | undefined>,
) {
  return computed(() => properties.value.value ?? uncontrolled.value)
}
