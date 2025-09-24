import { BaseOutProperties, Container, InProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'
import { computed } from '@preact/signals-core'

export type SeparatorProperties = InProperties<SeperatorOutProperties>

export type SeperatorOutProperties = BaseOutProperties & {
  orientation?: 'horizontal' | 'vertical'
}

export class Separator extends Container<SeperatorOutProperties> {
  constructor(
    inputProperties?: InProperties<SeperatorOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: any
      defaultOverrides?: InProperties<SeperatorOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexShrink: 0,
        backgroundColor: colors.border,
        width: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? '100%' : 1)),
        height: computed(() => ((this.properties.value.orientation ?? 'horizontal') === 'horizontal' ? 1 : '100%')),
        ...config?.defaultOverrides,
      },
    })
  }
}
