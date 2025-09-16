import {
  InProperties,
  BaseOutProperties,
  Input as InputImpl,
  ThreeEventMap,
  InputOutProperties as BaseInputOutProperties,
  RenderContext,
  withOpacity,
  inputDefaults,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors } from '../theme.js'

export type InputOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseInputOutProperties<EM>

export type InputProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<InputOutProperties<EM>>

export class Input<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends InputImpl<T, EM, InputOutProperties<EM>> {
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
  }
}
