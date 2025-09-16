import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Tabs } from './index.js'
import { searchFor } from '../utils.js'
import { colors, componentDefaults } from '../theme.js'

export type TabsContentOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: string
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
      const tabs = searchFor(this, Tabs, 2)
      return this.properties.value.value === tabs?.currentSignal.value
    })
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        marginTop: 8,
        display: computed(() => (isVisible.value ? 'flex' : 'none')),
        ...config?.defaultOverrides,
      },
    })
  }
}
