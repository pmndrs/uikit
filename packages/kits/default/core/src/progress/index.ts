import { BaseOutProperties, Container, InProperties, ThreeEventMap, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'

export type ProgressOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  value?: number
} & BaseOutProperties<EM>

export type ProgressProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<ProgressOutProperties<EM>>

export class Progress<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ProgressOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<ProgressOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { defaultOverrides?: InProperties<ProgressOutProperties<EM>>; renderContext?: RenderContext },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        height: 16,
        width: '100%',
        borderBottomLeftRadius: 1000,
        borderBottomRightRadius: 1000,
        borderTopRightRadius: 1000,
        borderTopLeftRadius: 1000,
        backgroundColor: colors.secondary,
        ...config?.defaultOverrides,
      },
    })
    super.add(
      new Container(undefined, undefined, {
        defaults: componentDefaults,
        defaultOverrides: {
          height: '100%',
          borderBottomLeftRadius: 1000,
          borderBottomRightRadius: 1000,
          borderTopRightRadius: 1000,
          borderTopLeftRadius: 1000,
          backgroundColor: colors.primary,
          width: computed(() => `${this.properties.value.value ?? 0}%` as const),
        },
      }),
    )
  }

  add(): this {
    throw new Error(`the progress component can not have any children`)
  }
}
