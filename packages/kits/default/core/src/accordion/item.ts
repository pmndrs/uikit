import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { Accordion } from './index.js'

export type AccordionItemOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: string
}

export type AccordionItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AccordionItemOutProperties<EM>
>

export class AccordionItem<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends AccordionItemOutProperties<EM> = AccordionItemOutProperties<EM>,
> extends Container<T, EM, AccordionItemOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<AccordionItemOutProperties<EM>>,
    initialClasses?: (string | InProperties<OutProperties>)[],
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
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
