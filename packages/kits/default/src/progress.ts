import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap, WithSignal } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { colors } from './theme.js'
import { componentDefaults } from '@pmndrs/uikit/src/properties/defaults.js'

export type ProgressOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  value?: number
} & BaseOutProperties<EM>

export type ProgressProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<ProgressOutProperties<EM>>

export const progressDefaults = {
  ...componentDefaults,
  height: 16,
  width: '100%',
  borderBottomLeftRadius: 1000,
  borderBottomRightRadius: 1000,
  borderTopRightRadius: 1000,
  borderTopLeftRadius: 1000,
  backgroundColor: colors.secondary,
}

export class Progress<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends ProgressOutProperties<EM> = ProgressOutProperties<EM>,
> extends Container<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties> | undefined,
    initialClasses?: (string | InProperties<BaseOutProperties<EM>>)[] | undefined,
    renderContext?: RenderContext,
    overrideDefaults = progressDefaults as WithSignal<OutProperties>,
  ) {
    super(inputProperties, initialClasses, renderContext, overrideDefaults)
    super.add(
      new Container(undefined, undefined, undefined, {
        height: '100%',
        borderBottomLeftRadius: 1000,
        borderBottomRightRadius: 1000,
        borderTopRightRadius: 1000,
        borderTopLeftRadius: 1000,
        backgroundColor: colors.primary,
        width: computed(() => `${this.properties.value.value ?? 0}%` as const),
      }),
    )
  }

  add(): this {
    throw new Error(`the progress component can not have any children`)
  }
}
