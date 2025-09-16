import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Accordion } from './index.js'
import { AccordionItem } from './item.js'
import { searchFor } from '../utils.js'
import { colors, componentDefaults } from '../theme.js'

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
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        paddingTop: 0,
        fontSize: 14,
        paddingBottom: 16,
        overflow: 'hidden',
        display: computed(() => {
          const item = searchFor(this, AccordionItem, 2)
          if (item == null) {
            return 'none'
          }
          const accordion = searchFor(item, Accordion, 2)
          return item.properties.value.value === accordion?.openItemValue.value ? 'flex' : 'none'
        }),
        ...config?.defaultOverrides,
      },
    })
  }
}
