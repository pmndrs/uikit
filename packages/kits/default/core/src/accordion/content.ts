import { BaseOutProperties, Container, ContainerProperties, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Accordion } from './index.js'
import { AccordionItem } from './item.js'

export type AccordionContentProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class AccordionContent<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
> extends Container<T, EM> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides: InProperties<OutProperties>
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


