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
import { Avatar, AvatarOutProperties } from '../avatar/index.js'

export type DropdownAvatarOutProperties<EM extends ThreeEventMap = ThreeEventMap> = AvatarOutProperties<EM>

export type DropdownAvatarProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DropdownAvatarOutProperties<EM>
>

export class DropdownAvatar<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Avatar<T, EM> {
  constructor(
    inputProperties?: InProperties<DropdownAvatarOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownAvatarOutProperties<EM>>
      defaults?: WithSignal<DropdownAvatarOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        size: computed(() => {
          const dropdown = this.parentContainer.value
          if (!(dropdown instanceof Dropdown)) {
            return 'sm'
          }
          const size = dropdown.properties.value.size ?? 'lg'
          if (size === 'lg') {
            return 'sm'
          }
          return 'xs'
        }),
        ...config?.defaultOverrides,
      },
    })
  }
}
