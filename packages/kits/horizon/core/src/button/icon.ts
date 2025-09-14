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

export class ButtonIcon<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
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
    const size = computed(() => {
      const btn = this.parentContainer.value
      if (!(btn instanceof Button)) {
        return 24
      }
      const size = btn.properties.value.size ?? 'md'
      if (size === 'md') {
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
      },
    })
  }
}
