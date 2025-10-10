import {
  InProperties,
  BaseOutProperties,
  Input as InputImpl,
  InputOutProperties as BaseInputOutProperties,
  RenderContext,
  withOpacity,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors, inputDefaults } from '../theme.js'

export type InputOutProperties = BaseInputOutProperties

export type InputProperties = InProperties<InputOutProperties>

export class Input extends InputImpl<InputOutProperties> {
  constructor(
    inputProperties?: InProperties<InputOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<InputOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: inputDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        height: 40,
        positionType: 'relative',
        overflow: 'scroll',
        scrollbarColor: withOpacity('black', 0),
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        borderColor: computed(() => (this.hasFocus.value ? colors.ring.value : colors.input.value)),
        borderWidth: 1,
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        fontSize: 14,
        paddingX: 12,
        paddingY: 8,
        lineHeight: '20px',
        placeholderStyle: {
          color: colors.mutedForeground,
        },
        ...config?.defaultOverrides,
      },
    })
    console
  }
}
