import { Container, ContainerProperties, SvgProperties, ThreeEventMap } from '@pmndrs/uikit'
import { ChevronDown } from '@pmndrs/uikit-lucide'
import { InProperties, BaseOutProperties } from '@pmndrs/uikit/src/properties'
import { computed, signal } from '@preact/signals-core'

export type AccordionProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class Accordion<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  readonly openItemValue = signal<string | undefined>(undefined)

  protected internalResetProperties(inputProperties?: AccordionProperties | undefined): void {
    super.internalResetProperties({
      flexDirection: 'column',
      ...inputProperties,
    })
  }
}

export type AccordionItemOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: string
}

export type AccordionItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AccordionItemOutProperties<EM>
>

export class AccordionItem<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AccordionItemOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: AccordionItemProperties<EM> | undefined): void {
    super.internalResetProperties({
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
      ...inputProperties,
    })
  }
}

export type AccordionTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class AccordionTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  protected internalResetProperties(inputProperties?: AccordionTriggerProperties<EM> | undefined): void {
    super.internalResetProperties({
      flexDirection: 'row',
      flexGrow: 1,
      flexShrink: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingY: 16,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: 'medium',
      ...inputProperties,
    })
  }
}

export type AccordionTriggerIconProperties<EM extends ThreeEventMap = ThreeEventMap> = SvgProperties<EM>

export class AccordionTriggerIcon<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends ChevronDown<T, EM> {
  protected internalResetProperties(inputProperties?: AccordionTriggerIconProperties<EM> | undefined): void {
    super.internalResetProperties({
      transformRotateZ: computed(() => (isSelected(this.parentContainer.value) ? 180 : 0)),
      width: 16,
      height: 16,
      flexShrink: 0,
      ...inputProperties,
    })
  }
}

export type AccordionContentProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class AccordionContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  protected internalResetProperties(inputProperties?: AccordionContentProperties<EM> | undefined): void {
    super.internalResetProperties({
      display: computed(() => (isSelected(this) ? 'flex' : 'none')),
      paddingTop: 0,
      fontSize: 14,
      paddingBottom: 16,
      overflow: 'hidden',
      ...inputProperties,
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
