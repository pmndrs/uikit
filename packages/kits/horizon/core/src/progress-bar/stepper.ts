import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'

export type ProgressBarStepperOutProperties = BaseOutProperties

export class ProgressBarStepper extends Container<ProgressBarStepperOutProperties> {
  constructor(
    inputProperties?: InProperties<ProgressBarStepperOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ProgressBarStepperOutProperties>
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
