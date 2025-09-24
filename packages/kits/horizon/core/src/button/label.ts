import { BaseOutProperties, componentDefaults, Container, InProperties, RenderContext, WithSignal } from '@pmndrs/uikit'

export class ButtonLabel extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties>
      defaults?: WithSignal<BaseOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        ...config?.defaultOverrides,
      },
    })
  }
}
