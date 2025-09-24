import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { Accordion } from './index.js'
import { colors, componentDefaults } from '../theme.js'

export type AccordionItemOutProperties = BaseOutProperties & {
  value?: string
}

export type AccordionItemProperties = InProperties<AccordionItemOutProperties>

export class AccordionItem extends Container<AccordionItemOutProperties> {
  constructor(
    inputProperties?: InProperties<AccordionItemOutProperties>,
    initialClasses?: (string | InProperties<BaseOutProperties>)[],
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AccordionItemOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        cursor: 'pointer',
        flexDirection: 'column',
        onClick: () => {
          const parent = this.parentContainer.peek()
          if (!(parent instanceof Accordion)) {
            return
          }
          const ownValue = this.properties.peek().value
          const currentValue = parent.openItemValue.peek()
          const isSelected = ownValue === currentValue
          parent.openItemValue.value = isSelected ? undefined : ownValue
        },
        borderBottomWidth: 1,
        ...config?.defaultOverrides,
      },
    })
  }
}
