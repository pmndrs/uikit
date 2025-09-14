import { BaseOutProperties, Container, InProperties, ThreeEventMap } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { componentDefaults } from '../theme.js'

export type LabelOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  disabled?: boolean
} & BaseOutProperties<EM>

export type LabelProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<LabelOutProperties<EM>>

export class Label<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, LabelOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<LabelOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: any
      defaultOverrides?: InProperties<LabelOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        fontWeight: 'medium',
        fontSize: 14,
        lineHeight: '100%',
        opacity: computed(() => (this.properties.value.disabled ? 0.7 : undefined)),
        ...config?.defaultOverrides,
      },
    })
  }
}
