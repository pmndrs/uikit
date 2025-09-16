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
import { Dropdown } from './index.js'

export type DropdownIconOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DropdownIconProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DropdownIconOutProperties<EM>
>

export class DropdownIcon<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<DropdownIconOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownIconOutProperties<EM>>
      defaults?: WithSignal<DropdownIconOutProperties<EM>>
    },
  ) {
    const size = computed(() => {
      const dropdown = this.parentContainer.value
      if (!(dropdown instanceof Dropdown)) {
        return 24
      }
      const size = dropdown.properties.value.size ?? 'lg'
      if (size === 'lg') {
        return 24
      }
      return 16
    })
    super(inputProperties, initialClasses, {
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
