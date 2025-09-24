import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'
import { RadioGroup } from './index.js'
import { searchFor } from '../utils.js'

export type RadioGroupItemOutProperties = {
  disabled?: boolean
  value?: string
} & BaseOutProperties

export type RadioGroupItemProperties = InProperties<RadioGroupItemOutProperties>

export class RadioGroupItem extends Container<RadioGroupItemOutProperties> {
  public readonly radioButton: Container
  public readonly radioDot: Container
  constructor(
    inputProperties?: RadioGroupItemProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<RadioGroupItemOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        cursor: computed(() => (this.properties.value.disabled ? undefined : 'pointer')),
        onClick: computed(() =>
          this.properties.value.disabled
            ? undefined
            : () => {
                const radioGroup = searchFor(this, RadioGroup, 2)
                if (radioGroup == null) {
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

    this.radioButton = new Container(undefined, undefined, {
      defaults: componentDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
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
    this.radioDot = new Container(undefined, undefined, {
      defaults: componentDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        borderRadius: 1000,
        aspectRatio: 1,
        backgroundColor: colors.primary,
        height: 9,
        width: 9,
        opacity: computed(() => (isSelected.value ? 1 : 0)),
      },
    })

    this.radioButton.add(this.radioDot)
    super.add(this.radioButton)
  }

  dispose(): void {
    this.radioDot.dispose()
    this.radioButton.dispose()
    super.dispose()
  }
}
