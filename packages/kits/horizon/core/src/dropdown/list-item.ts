import { BaseOutProperties, Container, InProperties, RenderContext, WithSignal } from '@pmndrs/uikit'
import { Dropdown } from './index.js'

export type DropdownListItemOutProperties = BaseOutProperties & {
  value?: string
}

export type DropdownListItemProperties = InProperties<DropdownListItemOutProperties>
export class DropdownListItem extends Container<DropdownListItemOutProperties> {
  constructor(
    inputProperties?: InProperties<DropdownListItemOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownListItemOutProperties>
      defaults?: WithSignal<DropdownListItemOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        paddingY: 8,
        paddingX: 16,
        onClick: (event) => {
          const dropdown = this.parentContainer.value?.parentContainer.value
          if (!(dropdown instanceof Dropdown)) {
            return
          }
          const value = this.properties.peek().value
          dropdown.uncontrolledSignal.value = value
          dropdown.properties.peek().onValueChange?.(value)
        },
        ...config?.defaultOverrides,
      },
    })
  }
}
