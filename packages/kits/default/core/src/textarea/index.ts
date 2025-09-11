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
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors } from '../theme.js'
import { Object3D } from 'three/src/Three.js'

export type TextareaOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  placeholder?: string
} & BaseInputOutProperties<EM>

export type TextareaProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<TextareaOutProperties<EM>>

export class Textarea<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  TextareaOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<TextareaOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TextareaOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        minHeight: 80,
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
      multiline: true,
      defaultOverrides: {
        verticalAlign: 'top',
        disabled: computed(() => this.properties.value.disabled),
      },
    })
    super.add(inputImpl)

    // Always create placeholder text
    const placeholderText = new Text(undefined, undefined, {
      defaultOverrides: {
        color: colors.mutedForeground,
        inset: 0,
        verticalAlign: 'top',
        text: this.properties.signal.placeholder,
        positionType: 'absolute',
        display: computed(() => (inputImpl.currentSignal.value.length === 0 ? 'flex' : 'none')),
      },
    })
    super.add(placeholderText)
  }

  add(...object: Object3D[]): this {
    throw new Error(`the input component can not have any children`)
  }
}
