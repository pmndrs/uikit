import {
  BaseOutProperties,
  Component,
  Container,
  InProperties,
  RenderContext,
  ThreeEventMap,
  Text,
} from '@pmndrs/uikit'
import { Input, InputOutProperties } from '../input/index.js'
import { theme } from '../theme.js'
import { computed } from '@preact/signals-core'

export type InputFieldOutProperties<EM extends ThreeEventMap = ThreeEventMap> = InputOutProperties<EM> & {
  label?: string
  leftIcon?: {
    new (
      InputFieldProperties: any,
      initialClasses: any,
      config: { defaultOverrides?: InProperties<BaseOutProperties<EM>> },
    ): Component
  }
  rightIcon?: {
    new (
      InputFieldProperties: any,
      initialClasses: any,
      config: { defaultOverrides?: InProperties<BaseOutProperties<EM>> },
    ): Component
  }
}

export type InputFieldProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<InputFieldOutProperties<EM>>

export class InputField<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  InputFieldOutProperties<EM>
> {
  public readonly label: Text<{}, EM>
  public readonly input: Input<{}, EM>

  constructor(
    InputFieldProperties?: InProperties<InputFieldOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<InputFieldOutProperties<EM>>
    },
  ) {
    const hovered = computed(() => this.hoveredList.value.length > 0)
    super(InputFieldProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        cursor: 'text',
        width: '100%',
        flexDirection: 'column',
        gap: 12,
        paddingX: 16,
        paddingY: 8,
        //exists to make sure the handlers are applied
        hover: {},
        backgroundColor: computed(() => {
          if (this.input.input.hasFocus.value) {
            return theme.component.inputField.background.default.value
          }
          if (hovered.value) {
            return theme.component.inputField.background.hovered.value
          }
          return theme.component.inputField.background.default.value
        }),
        ...config?.defaultOverrides,
      },
    })
    this.addEventListener('click', () => this.input.input.focus())
    this.label = new Text(undefined, undefined, {
      defaultOverrides: {
        text: this.properties.signal.label,
        fontSize: 12,
        lineHeight: '16px',
        fontWeight: 500,
        color: theme.component.inputField.label,
      },
    })
    super.add(this.label)
    this.input = new Input<{}, EM>(undefined, undefined, {
      hovered,
      defaultOverrides: {
        placeholder: this.properties.signal.placeholder,
        defaultValue: this.properties.signal.defaultValue,
        value: this.properties.signal.value,
        disabled: this.properties.signal.disabled,
        tabIndex: this.properties.signal.tabIndex,
        autocomplete: this.properties.signal.autocomplete,
        type: this.properties.signal.type,
        onValueChange: this.properties.signal.onValueChange,
        onFocusChange: this.properties.signal.onFocusChange,
        textAlign: 'left',
        size: 'lg',
        variant: 'text',
        leftIcon: this.properties.signal.leftIcon,
        rightIcon: this.properties.signal.rightIcon,
      },
    })
    super.add(this.input)
  }

  dispose(): void {
    this.label.dispose()
    this.input.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the InputField component can not have any children`)
  }
}
