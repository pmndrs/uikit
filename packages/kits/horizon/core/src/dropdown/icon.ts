import { BaseOutProperties, componentDefaults, Container, InProperties, RenderContext, WithSignal } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Dropdown } from './index.js'

export type DropdownIconOutProperties = BaseOutProperties

export type DropdownIconProperties = InProperties<DropdownIconOutProperties>

export class DropdownIcon extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: InProperties<DropdownIconOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownIconOutProperties>
      defaults?: WithSignal<DropdownIconOutProperties>
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
