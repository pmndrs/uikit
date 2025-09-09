import {
  InProperties,
  BaseOutProperties,
  Container,
  Input as InputImpl,
  Text,
  ThreeEventMap,
  InputOutProperties as BaseInputOutProperties,
  RenderContext,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'
import { Object3D } from 'three/src/Three.js'

export type InputOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  placeholder?: string
} & BaseInputOutProperties<EM>

export type InputProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<InputOutProperties<EM>>

export class Input<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, InputOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<InputOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<InputOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        height: 40,
        positionType: 'relative',
        overflow: 'hidden',
        fontSize: 14,
        borderWidth: 1,
        paddingX: 12,
        paddingY: 8,
        lineHeight: '20px',
        opacity: computed(() => (this.properties.signal.disabled?.value ? 0.5 : undefined)),
        disabled: computed(() => this.properties.signal.disabled?.value),
        ...config?.defaultOverrides,
      },
    })
    // Create input implementation
    const inputImpl = new InputImpl(undefined, undefined, {
      defaultOverrides: {
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        borderColor: colors.input,
        inset: 0,
      },
    })
    super.add(inputImpl)

    // Always create placeholder text
    const placeholderText = new Text(undefined, undefined, {
      defaultOverrides: {
        color: colors.mutedForeground,
        inset: 0,
        positionType: 'absolute',
        display: computed(() => (this.properties.value.placeholder != null ? 'flex' : 'none')),
      },
    })
    super.add(placeholderText)
  }

  add(...object: Object3D[]): this {
    throw new Error(`the input component can not have any children`)
  }
}
