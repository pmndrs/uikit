import { BaseOutProperties, InProperties, RenderContext, SvgOutProperties } from '@pmndrs/uikit'
import { ChevronDownIcon } from '@pmndrs/uikit-lucide'
import { computed } from '@preact/signals-core'
import { Dropdown } from './index.js'

export type DropdownButtonOutProperties = SvgOutProperties

export type DropdownButtonProperties = InProperties<DropdownButtonOutProperties>

export class DropdownButton extends ChevronDownIcon<DropdownButtonOutProperties> {
  constructor(
    inputProperties?: InProperties<DropdownButtonOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownButtonOutProperties>
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
        width: size,
        height: size,
        ...config?.defaultOverrides,
      },
    })
  }
}
