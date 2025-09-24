import { BaseOutProperties, componentDefaults, Container, InProperties, RenderContext, WithSignal } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Button } from './index.js'

export class ButtonIcon extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties>
      defaults?: WithSignal<BaseOutProperties>
    },
  ) {
    const size = computed(() => {
      const btn = this.parentContainer.value
      if (!(btn instanceof Button)) {
        return 24
      }
      const size = btn.properties.value.size ?? 'lg'
      if (size === 'lg') {
        return 24
      }
      return 16
    })
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          width: size,
          height: size,
        },
        ...config?.defaultOverrides,
      },
    })
  }
}
