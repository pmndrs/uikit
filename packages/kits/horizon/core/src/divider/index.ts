import { BaseOutProperties, Container, InProperties, ThreeEventMap } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { theme } from '../theme.js'

export type DividerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<DividerOutProperties<EM>>

export type DividerOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  orientation?: 'horizontal' | 'vertical'
}

export class Divider<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DividerOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<DividerOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: any
      defaultOverrides?: InProperties<DividerOutProperties<EM>>
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
