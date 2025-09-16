import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { RadioGroup } from './index.js'
import { theme } from '../theme.js'

export type RadioGroupItemOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
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
  public readonly button: Container

  constructor(
    inputProperties?: RadioGroupItemProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<RadioGroupItemOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        fontSize: 14,
        lineHeight: '20px',
        color: theme.semantic.text.primary,
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
