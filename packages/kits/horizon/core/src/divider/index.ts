import { BaseOutProperties, Container, InProperties } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { theme } from '../theme.js'

export type DividerProperties = InProperties<DividerOutProperties>

export type DividerOutProperties = BaseOutProperties & {
  orientation?: 'horizontal' | 'vertical'
}

export class Divider extends Container<DividerOutProperties> {
  constructor(
    inputProperties?: InProperties<DividerOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: any
      defaultOverrides?: InProperties<DividerOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexShrink: 0,
        backgroundColor: theme.component.progressBar.quickReplies.dividers,
        width: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? '100%' : 1)),
        height: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? 1 : '100%')),
        ...config?.defaultOverrides,
      },
    })
  }
}
