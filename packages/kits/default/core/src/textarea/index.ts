import {
  InProperties,
  BaseOutProperties,
  Container,
  Input as InputImpl,
  Text,
  InputOutProperties as BaseInputOutProperties,
  RenderContext,
  withOpacity,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors, inputDefaults, textDefaults } from '../theme.js'
import type { Object3D } from 'three'

export type TextareaOutProperties = {
  placeholder?: string
} & BaseInputOutProperties

export type TextareaProperties = InProperties<TextareaOutProperties>

export class Textarea extends Container<TextareaOutProperties> {
  public readonly input: InputImpl
  public readonly placeholder: Text
  constructor(
    inputProperties?: InProperties<TextareaOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TextareaOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: inputDefaults,
      ...config,
      defaultOverrides: {
        minHeight: 80,
        positionType: 'relative',
        overflow: 'scroll',
        scrollbarColor: withOpacity('black', 0),
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        borderColor: computed(() => (inputImpl.hasFocus.value ? colors.ring.value : colors.input.value)),
        borderWidth: 1,
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        '*': {
          borderColor: colors.border,
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
      multiline: true,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        verticalAlign: 'top',
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
        '*': {
          borderColor: colors.border,
        },
        color: colors.mutedForeground,
        inset: 0,
        verticalAlign: 'top',
        text: this.properties.signal.placeholder,
        positionType: 'absolute',
        display: computed(() => (inputImpl.currentSignal.value.length === 0 ? 'flex' : 'none')),
      },
    })
    this.placeholder = placeholderText
    super.add(this.placeholder)
  }

  dispose(): void {
    this.placeholder.dispose()
    this.input.dispose()
    super.dispose()
  }

  add(...object: Object3D[]): this {
    throw new Error(`the input component can not have any children`)
  }
}
