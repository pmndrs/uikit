import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { colors } from './theme.js'

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
    inputProperties?: InProperties<ProgressOutProperties<EM>> | undefined,
    initialClasses?: (string | InProperties<BaseOutProperties<EM>>)[] | undefined,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext)
    super.add(
      new Container({
        height: '100%',
        borderRadius: 1000,
        backgroundColor: colors.primary,
        width: computed(() => `${this.properties.value.value ?? 0}%` as const),
      }),
    )
  }

  protected internalResetProperties({ value, ...rest }: ProgressProperties<EM> = {}): void {
    super.internalResetProperties({
      height: 16,
      width: '100%',
      borderRadius: 1000,
      backgroundColor: colors.secondary,
      ...rest,
    })
  }

  add(): this {
    throw new Error(`the progress component can not have any children`)
  }
}
