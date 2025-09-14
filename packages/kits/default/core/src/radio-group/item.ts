import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'
import { RadioGroup } from './index.js'
import { searchFor } from '../utils.js'

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
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<RadioGroupItemOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        cursor: computed(() => (this.properties.value.disabled ? undefined : 'pointer')),
        onClick: computed(() =>
          this.properties.value.disabled
            ? undefined
            : () => {
                const radioGroup = this.parentContainer.peek()
                if (!(radioGroup instanceof RadioGroup)) {
                  return
                }
                const value = this.properties.peek().value
                if (radioGroup.properties.peek().value == null) {
                  radioGroup.uncontrolledSignal.value = value
                }
                radioGroup.properties.peek().onValueChange?.(value)
              },
        ),
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        disabled: computed(() => this.properties.value.disabled),
        ...config?.defaultOverrides,
      },
    })
    const isSelected = computed(
      () => searchFor(this, RadioGroup, 2)?.currentSignal.value === this.properties.value.value,
    )

    const radioButton = new Container(undefined, undefined, {
      defaults: componentDefaults,
      defaultOverrides: {
        aspectRatio: 1,
        height: 16,
        width: 16,
        borderRadius: 1000,
        borderWidth: 1,
        borderColor: colors.primary,
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        alignItems: 'center',
        justifyContent: 'center',
      },
    })
    const radioDot = new Container(undefined, undefined, {
      defaults: componentDefaults,
      defaultOverrides: {
        borderRadius: 1000,
        aspectRatio: 1,
        backgroundColor: colors.primary,
        height: 9,
        width: 9,
        opacity: computed(() => (isSelected.value ? 1 : 0)),
      },
    })

    radioButton.add(radioDot)
    super.add(radioButton)
  }
}
