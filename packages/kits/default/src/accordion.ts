import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  SvgOutProperties,
  SvgProperties,
  ThreeEventMap,
} from '@pmndrs/uikit'
import { ChevronDown } from '@pmndrs/uikit-lucide'
import { computed, signal } from '@preact/signals-core'

export type AccordionProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class Accordion<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
> extends Container<T, EM> {
  readonly openItemValue = signal<string | undefined>(undefined)

  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: (string | InProperties<BaseOutProperties<EM>>)[],
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        ...config?.defaultOverrides,
      },
    })
  }
}

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

export type AccordionTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export type AccordionTriggerOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export class AccordionTrigger<
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
        flexDirection: 'row',
        flexGrow: 1,
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingBottom: 16,
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 'medium',
        ...config?.defaultOverrides,
      },
    })
  }
}

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
        transformRotateZ: computed(() => (isSelected(this.parentContainer.value) ? 180 : 0)),
        ...config?.defaultOverrides,
      } as InProperties<OutProperties>,
    })
  }
}

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
        display: computed(() => (isSelected(this) ? 'flex' : 'none')),
        ...config?.defaultOverrides,
      },
    })
  }
}

function isSelected(container: Container | undefined) {
  const accrdionTrigger = container?.parentContainer.value
  if (!(accrdionTrigger instanceof AccordionItem)) {
    return false
  }
  const accordion = accrdionTrigger.parentContainer.value
  if (!(accordion instanceof Accordion)) {
    return false
  }
  return accrdionTrigger.properties.value.value === accordion.openItemValue.value
}
