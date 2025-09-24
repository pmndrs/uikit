import { BaseOutProperties, Container, InProperties } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'

export type LabelOutProperties = {
  disabled?: boolean
} & BaseOutProperties

export type LabelProperties = InProperties<LabelOutProperties>

export class Label extends Container<LabelOutProperties> {
  constructor(
    inputProperties?: InProperties<LabelOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: any
      defaultOverrides?: InProperties<LabelOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        fontWeight: 'medium',
        fontSize: 14,
        lineHeight: '100%',
        opacity: computed(() => (this.properties.value.disabled ? 0.7 : undefined)),
        ...config?.defaultOverrides,
      },
    })
  }
}
