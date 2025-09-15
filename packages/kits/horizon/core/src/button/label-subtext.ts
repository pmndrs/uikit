import {
  BaseOutProperties,
  componentDefaults,
  Container,
  InProperties,
  RenderContext,
  ThreeEventMap,
  WithSignal,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Button } from './index.js'
import { lightTheme } from '../theme.js'

export class ButtonLabelSubtext<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties<EM>>
      defaults?: WithSignal<BaseOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        fontSize: 12,
        lineHeight: '16px',
        color: computed(() => {
          const button = this.parentContainer.value?.parentContainer.value
          if (!(button instanceof Button)) {
            return undefined
          }
          if (button.properties.value.disabled === true) {
            lightTheme.component.button[button.properties.value.variant ?? 'primary'].subtext.disabled.value
          }
          return lightTheme.component.button[button.properties.value.variant ?? 'primary'].subtext.default.value
        }),
        ...config?.defaultOverrides,
      },
    })
  }
}
