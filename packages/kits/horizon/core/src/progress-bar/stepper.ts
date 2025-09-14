import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'

export type ProgressBarStepperOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export class ProgressBarStepper<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ProgressBarStepperOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<ProgressBarStepperOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ProgressBarStepperOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'row',
        height: 12,
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
  }
}
