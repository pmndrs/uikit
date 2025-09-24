import { BaseOutProperties, componentDefaults, Container, InProperties, RenderContext, WithSignal } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Dropdown } from './index.js'
import { Avatar, AvatarOutProperties } from '../avatar/index.js'

export type DropdownAvatarOutProperties = AvatarOutProperties

export type DropdownAvatarProperties = InProperties<DropdownAvatarOutProperties>

export class DropdownAvatar extends Avatar {
  constructor(
    inputProperties?: InProperties<DropdownAvatarOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownAvatarOutProperties>
      defaults?: WithSignal<DropdownAvatarOutProperties>
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
