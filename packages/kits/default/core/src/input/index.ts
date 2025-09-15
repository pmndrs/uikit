import {
  InProperties,
  BaseOutProperties,
  Container,
  Input as InputImpl,
  Text,
  ThreeEventMap,
  InputOutProperties as BaseInputOutProperties,
  RenderContext,
  withOpacity,
  inputDefaults,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors, componentDefaults, textDefaults } from '../theme.js'
import { Object3D } from 'three/src/Three.js'

export type InputOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  placeholder?: string
} & BaseInputOutProperties<EM>

export type InputProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<InputOutProperties<EM>>

export class Input<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, InputOutProperties<EM>> {
  public readonly input!: InputImpl
  public readonly placeholder!: Text
  constructor(
    inputProperties?: InProperties<InputOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<InputOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: inputDefaults,
      ...config,
      defaultOverrides: {
        height: 40,
        positionType: 'relative',
        overflow: 'scroll',
        scrollbarBackgroundColor: withOpacity('black', 0),
        scrollbarColor: withOpacity('black', 0),
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        borderColor: computed(() => (inputImpl.hasFocus.value ? colors.ring.value : colors.input.value)),
        borderWidth: 1,
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        '*': {
          height: '100%',
          width: '100%',
          fontSize: 14,
          paddingX: 12,
          paddingY: 8,
          lineHeight: '20px',
        },
        ...config?.defaultOverrides,
      },
    })
    // Create input implementation
    const inputImpl = new InputImpl(undefined, undefined, {
      defaults: inputDefaults,
      multiline: false,
      defaultOverrides: {
        defaultValue: this.properties.signal.defaultValue,
        value: this.properties.signal.value,
        disabled: this.properties.signal.disabled,
        tabIndex: this.properties.signal.tabIndex,
        autocomplete: this.properties.signal.autocomplete,
        type: this.properties.signal.type,
        onValueChange: this.properties.signal.onValueChange,
        onFocusChange: this.properties.signal.onFocusChange,
      },
    })
    this.input = inputImpl
    super.add(this.input)

    // Always create placeholder text
    const placeholderText = new Text(undefined, undefined, {
      defaults: textDefaults,
      defaultOverrides: {
        color: colors.mutedForeground,
        inset: 0,
        text: this.properties.signal.placeholder,
        positionType: 'absolute',
        display: computed(() => (inputImpl.currentSignal.value.length === 0 ? 'flex' : 'none')),
      },
    })
    this.placeholder = placeholderText
    super.add(this.placeholder)
  }

  add(...object: Object3D[]): this {
    throw new Error(`the input component can not have any children`)
  }
}
