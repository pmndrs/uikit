import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Accordion } from './index.js'
import { AccordionItem } from './item.js'

export type AccordionContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class AccordionContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides: InProperties<BaseOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        paddingTop: 0,
        fontSize: 14,
        paddingBottom: 16,
        overflow: 'hidden',
        display: computed(() => {
          const item = this.parentContainer.value
          if (!(item instanceof AccordionItem)) return 'none'
          const accordion = item.parentContainer.value
          if (!(accordion instanceof Accordion)) return 'none'
          return item.properties.value.value === accordion.openItemValue.value ? 'flex' : 'none'
        }),
        ...config?.defaultOverrides,
      },
    })
  }
}
