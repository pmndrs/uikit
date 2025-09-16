import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap, WithSignal } from '@pmndrs/uikit'
import { theme } from '../theme.js'
import { computed } from '@preact/signals-core'
import { Dropdown } from './index.js'

export type DropdownListOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DropdownListProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DropdownListOutProperties<EM>
>
export class DropdownList<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DropdownListOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<DropdownListOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownListOutProperties<EM>>
      defaults?: WithSignal<DropdownListOutProperties<EM>>
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
