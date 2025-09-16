import {
  BaseOutProperties,
  componentDefaults,
  Container,
  InProperties,
  RenderContext,
  Text,
  TextOutProperties,
  ThreeEventMap,
  WithSignal,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Dropdown } from './index.js'
import { PhoneForwarded } from '@pmndrs/uikit-lucide'

export type DropdownTextValueOutProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<
  TextOutProperties<EM>,
  'text'
> & {
  placeholder?: string
}

export type DropdownTextValueProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DropdownTextValueOutProperties<EM>
>

export class DropdownTextValue<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Text<
  T,
  EM,
  DropdownTextValueOutProperties<EM> & { text?: string }
> {
  constructor(
    inputProperties?: InProperties<DropdownTextValueOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownTextValueOutProperties<EM>>
      defaults?: WithSignal<DropdownTextValueOutProperties<EM>>
    },
  ) {
    const text = computed(() => {
      const dropdown = this.parentContainer.value
      if (dropdown instanceof Dropdown && dropdown.currentSignal.value != null) {
        return dropdown.currentSignal.value
      }
      return this.properties.value.placeholder
    })
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        text,
        ...config?.defaultOverrides,
      },
    })
  }
}
