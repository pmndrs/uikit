import {
  BaseOutProperties,
  componentDefaults,
  Container,
  InProperties,
  RenderContext,
  ThreeEventMap,
  WithSignal,
} from '@pmndrs/uikit'

export class ButtonLabel<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties<EM>>
      defaults?: WithSignal<BaseOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
      },
    })
  }
}
