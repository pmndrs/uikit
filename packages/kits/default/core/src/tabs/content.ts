import { Container, InProperties, BaseOutProperties, RenderContext, searchFor } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Tabs } from './index.js'
import { colors, componentDefaults } from '../theme.js'

export type TabsContentOutProperties = BaseOutProperties & {
  value?: string
}

export type TabsContentProperties = InProperties<TabsContentOutProperties>

export class TabsContent extends Container<TabsContentOutProperties> {
  constructor(
    inputProperties?: TabsContentProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TabsContentOutProperties> },
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
