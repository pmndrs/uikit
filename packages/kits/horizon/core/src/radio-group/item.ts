import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { RadioGroup } from './index.js'
import { theme } from '../theme.js'

export type RadioGroupItemOutProperties = {
  value?: string
} & BaseOutProperties

export type RadioGroupItemProperties = InProperties<RadioGroupItemOutProperties>

export class RadioGroupItem extends Container<RadioGroupItemOutProperties> {
  public readonly button: Container

  constructor(
    inputProperties?: RadioGroupItemProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<RadioGroupItemOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.component.semantic.text.primary,
        fontWeight: 500,
        cursor: 'pointer',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        onClick: (e) => {
          e.stopPropagation?.()
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
        ...config?.defaultOverrides,
      },
    })
    const isSelected = computed(() =>
      this.parentContainer.value instanceof RadioGroup
        ? this.parentContainer.value.currentSignal.value === this.properties.value.value
        : false,
    )
    this.button = new Container(undefined, undefined, {
      defaultOverrides: {
        width: 16,
        height: 16,
        borderWidth: 4,
        borderRadius: 1000,
        borderColor: computed(() =>
          isSelected.value ? theme.component.radioButtons.background.selected.value : undefined,
        ),
        backgroundColor: theme.component.radioButtons.background.default,
        hover: {
          backgroundColor: theme.component.radioButtons.background.hovered,
        },
        active: {
          backgroundColor: theme.component.radioButtons.background.pressed,
        },
        important: {
          backgroundColor: computed(() =>
            isSelected.value ? theme.component.radioButtons.icon.selected.value : undefined,
          ),
        },
      },
    })
    super.add(this.button)
  }

  dispose(): void {
    this.button.dispose()
    super.dispose()
  }
}
