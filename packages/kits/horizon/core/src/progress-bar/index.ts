import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { lightTheme } from '../theme.js'

export type ProgressBarOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: number
}

export class ProgressBar<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ProgressBarOutProperties<EM>
> {
  public readonly fill!: Container
  constructor(
    inputProperties?: InProperties<ProgressBarOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ProgressBarOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        borderRadius: 1000,
        height: 12,
        backgroundColor: lightTheme.component.progressBar.determinate.background.background.value,
        ...config?.defaultOverrides,
      },
    })
    super.add(
      (this.fill = new Container(undefined, undefined, {
        defaultOverrides: {
          height: 12,
          borderRadius: 1000,
          backgroundColor: lightTheme.component.progressBar.determinate.fill.fill.value,
          width: computed(() => `${this.properties.value.value ?? 0}%` as const),
          minWidth: 12,
        },
      })),
    )
  }

  add(): this {
    throw new Error(`the ProgressBar component can not have any children`)
  }
}

export * from './stepper.js'
export * from './stepper-step.js'
