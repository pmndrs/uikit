import { BaseOutProperties, Container, InProperties, RenderContext, WithSignal } from '@pmndrs/uikit'
import { theme } from '../theme.js'
import { computed } from '@preact/signals-core'
import { Dropdown } from './index.js'

export type DropdownListOutProperties = BaseOutProperties

export type DropdownListProperties = InProperties<DropdownListOutProperties>
export class DropdownList extends Container<DropdownListOutProperties> {
  constructor(
    inputProperties?: InProperties<DropdownListOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownListOutProperties>
      defaults?: WithSignal<DropdownListOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        minWidth: '100%',
        backgroundColor: theme.component.selectionDropdown.background.fill.hovered,
        color: theme.component.selectionDropdown.label.hovered,
        display: computed(() =>
          this.parentContainer.value instanceof Dropdown && this.parentContainer.value.currentOpenSignal.value
            ? 'flex'
            : 'none',
        ),
        flexDirection: 'column',
        positionType: 'absolute',
        positionTop: '110%',
        positionLeft: 0,
        borderRadius: 16,
        padding: 8,
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
  }
}
