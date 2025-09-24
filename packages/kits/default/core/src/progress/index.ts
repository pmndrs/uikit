import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'

export type ProgressOutProperties = {
  value?: number
} & BaseOutProperties

export type ProgressProperties = InProperties<ProgressOutProperties>

export class Progress extends Container<ProgressOutProperties> {
  public readonly fill: Container
  constructor(
    inputProperties?: InProperties<ProgressOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { defaultOverrides?: InProperties<ProgressOutProperties>; renderContext?: RenderContext },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
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
      (this.fill = new Container(undefined, undefined, {
        defaults: componentDefaults,
        defaultOverrides: {
          '*': {
            borderColor: colors.border,
          },
          height: '100%',
          borderBottomLeftRadius: 1000,
          borderBottomRightRadius: 1000,
          borderTopRightRadius: 1000,
          borderTopLeftRadius: 1000,
          backgroundColor: colors.primary,
          width: computed(() => `${this.properties.value.value ?? 0}%` as const),
        },
      })),
    )
  }

  dispose(): void {
    this.fill.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the progress component can not have any children`)
  }
}
