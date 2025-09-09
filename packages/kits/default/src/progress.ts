import { BaseOutProperties, Container, InProperties, ThreeEventMap, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { colors } from './theme.js'

export type ProgressOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  value?: number
} & BaseOutProperties<EM>

export type ProgressProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<ProgressOutProperties<EM>>

export class Progress<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends ProgressOutProperties<EM> = ProgressOutProperties<EM>,
> extends Container<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { defaultOverrides?: InProperties<OutProperties>; renderContext?: RenderContext },
  ) {
    super(inputProperties, initialClasses, {
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
      } as InProperties<OutProperties>,
    })
    super.add(
      new Container(undefined, undefined, {
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
