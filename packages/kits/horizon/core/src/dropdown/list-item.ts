import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap, WithSignal } from '@pmndrs/uikit'
import { Dropdown } from './index.js'

export type DropdownListItemOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: string
}

export type DropdownListItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DropdownListItemOutProperties<EM>
>
export class DropdownListItem<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DropdownListItemOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<DropdownListItemOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownListItemOutProperties<EM>>
      defaults?: WithSignal<DropdownListItemOutProperties<EM>>
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
