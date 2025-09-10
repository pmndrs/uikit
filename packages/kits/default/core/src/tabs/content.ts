import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Tabs } from './index.js'

export type TabsContentOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value: string
}

export type TabsContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<TabsContentOutProperties<EM>>

export class TabsContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  TabsContentOutProperties<EM>
> {
  constructor(
    inputProperties?: TabsContentProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TabsContentOutProperties<EM>> },
  ) {
    const isVisible = computed(() => {
      const tabs = this.parentContainer.value
      if (!(tabs instanceof Tabs)) {
        return false
      }
      return this.properties.value.value === tabs.getCurrentValueSignal().value
    })
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        marginTop: 8,
        display: computed(() => (isVisible.value ? 'flex' : 'none')),
        ...config?.defaultOverrides,
      } as InProperties<TabsContentOutProperties<EM>>,
    })
  }
}



