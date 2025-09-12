import {
  SvgOutProperties,
  SvgProperties,
  ThreeEventMap,
  InProperties,
  RenderContext,
  BaseOutProperties,
} from '@pmndrs/uikit'
import { ChevronDown } from '@pmndrs/uikit-lucide'
import { computed } from '@preact/signals-core'
import { Accordion } from './index.js'
import { AccordionItem } from './item.js'
import { searchFor } from '../utils.js'

export type AccordionTriggerIconProperties<EM extends ThreeEventMap = ThreeEventMap> = SvgProperties<EM>

export class AccordionTriggerIcon<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends ChevronDown<
  T,
  EM,
  SvgOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<SvgOutProperties<EM>>,
    initialClasses?: Array<BaseOutProperties<EM> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<SvgOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        width: 16,
        height: 16,
        flexShrink: 0,
        transformRotateZ: computed(() => {
          const item = searchFor(this, AccordionItem, 2)
          if (item == null) {
            return 0
          }
          const accordion = searchFor(item, Accordion, 2)
          return item.properties.value.value === accordion?.openItemValue.value ? 180 : 0
        }),
        ...config?.defaultOverrides,
      },
    })
  }
}
