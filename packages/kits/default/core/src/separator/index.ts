import { BaseOutProperties, Container, InProperties, ThreeEventMap } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
import { computed } from '@preact/signals-core'

export type SeparatorProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<SeperatorOutProperties<EM>>

export type SeperatorOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  orientation?: 'horizontal' | 'vertical'
}

export class Separator<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  SeperatorOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<SeperatorOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: any
      defaultOverrides?: InProperties<SeperatorOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        flexShrink: 0,
        backgroundColor: colors.border,
        width: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? '100%' : 1)),
        height: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? 1 : '100%')),
        ...config?.defaultOverrides,
      },
    })
  }
}
