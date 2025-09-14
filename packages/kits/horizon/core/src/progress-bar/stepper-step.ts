import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { lightTheme } from '../theme.js'

export type ProgressBarStepperStepOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: boolean
}

export class ProgressBarStepperStep<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ProgressBarStepperStepOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<ProgressBarStepperStepOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ProgressBarStepperStepOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        borderRadius: 1000,
        height: 12,
        flexGrow: 1,
        backgroundColor: computed(() =>
          this.properties.value.value
            ? lightTheme.component.progressBar.determinate.fill.fill.value
            : lightTheme.component.progressBar.determinate.background.background.value,
        ),
        ...config?.defaultOverrides,
      },
    })
  }

  add(): this {
    throw new Error(`the ProgressBarStepperStep component can not have any children`)
  }
}
