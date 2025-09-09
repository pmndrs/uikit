import { BaseOutProperties, Container, InProperties, ThreeEventMap } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'

export type LabelOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  disabled?: boolean
} & BaseOutProperties<EM>

export type LabelProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<LabelOutProperties<EM>>

export class Label<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends LabelOutProperties<EM> = LabelOutProperties<EM>,
> extends Container<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: any
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        fontWeight: 'medium',
        fontSize: 14,
        lineHeight: '100%',
        opacity: computed(() => (this.properties.signal.disabled?.value ? 0.7 : undefined)),
        ...config?.defaultOverrides,
      } as InProperties<OutProperties>,
    })
  }
}
