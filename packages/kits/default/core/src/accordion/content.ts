import { searchFor, BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Accordion } from './index.js'
import { AccordionItem } from './item.js'
import { colors, componentDefaults } from '../theme.js'

export type AccordionContentProperties = InProperties<BaseOutProperties>

export class AccordionContent extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides: InProperties<BaseOutProperties>
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
