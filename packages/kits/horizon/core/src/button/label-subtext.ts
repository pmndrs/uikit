import {
  BaseOutProperties,
  componentDefaults,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  WithSignal,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Button } from './index.js'
import { theme } from '../theme.js'

export type ButtonLabelSubtextProperties = ContainerProperties

export class ButtonLabelSubtext extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties>
      defaults?: WithSignal<BaseOutProperties>
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
            theme.component.button[button.properties.value.variant ?? 'primary'].subtext.disabled.value
          }
          return theme.component.button[button.properties.value.variant ?? 'primary'].subtext.default.value
        }),
        ...config?.defaultOverrides,
      },
    })
  }
}
