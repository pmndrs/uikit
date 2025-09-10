import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  ThreeEventMap,
} from '@pmndrs/uikit'
import { signal } from '@preact/signals-core'

export type AccordionProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class Accordion<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
> extends Container<T, EM> {
  readonly openItemValue = signal<string | undefined>(undefined)

  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: (string | InProperties<BaseOutProperties<EM>>)[],
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './item.js'
export * from './trigger.js'
export * from './trigger-icon.js'
export * from './content.js'
