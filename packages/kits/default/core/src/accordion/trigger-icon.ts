import { SvgOutProperties, SvgProperties, ThreeEventMap, InProperties, RenderContext } from '@pmndrs/uikit'
import { ChevronDown } from '@pmndrs/uikit-lucide'
import { computed } from '@preact/signals-core'
import { Accordion } from './index.js'
import { AccordionItem } from './item.js'

export type AccordionTriggerIconProperties<EM extends ThreeEventMap = ThreeEventMap> = SvgProperties<EM>

export class AccordionTriggerIcon<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends SvgOutProperties<EM> = SvgOutProperties<EM>,
> extends ChevronDown<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<SvgProperties<EM> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
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
      } as InProperties<OutProperties>,
    })
  }
}


