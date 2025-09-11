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
          const triggerContainer = this.parentContainer.value
          const item = triggerContainer?.parentContainer.value
          if (!(item instanceof AccordionItem)) return 0
          const accordion = item.parentContainer.value
          if (!(accordion instanceof Accordion)) return 0
          return item.properties.value.value === accordion.openItemValue.value ? 180 : 0
        }),
        ...config?.defaultOverrides,
      },
    })
  }
}
