import { BaseOutProperties, InProperties, RenderContext, SvgOutProperties, ThreeEventMap } from '@pmndrs/uikit'
import { ChevronDownIcon } from '@pmndrs/uikit-lucide'
import { computed } from '@preact/signals-core'
import { Dropdown } from './index.js'

export type DropdownButtonOutProperties<EM extends ThreeEventMap = ThreeEventMap> = SvgOutProperties<EM>

export type DropdownButtonProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DropdownButtonOutProperties<EM>
>

export class DropdownButton<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends ChevronDownIcon<
  T,
  EM,
  DropdownButtonOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<DropdownButtonOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownButtonOutProperties<EM>>
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
