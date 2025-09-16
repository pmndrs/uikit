import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  ThreeEventMap,
} from '@pmndrs/uikit'
import { signal } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'

export type AccordionProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class Accordion<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  readonly openItemValue = signal<string | undefined>(undefined)

  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: (string | InProperties<BaseOutProperties<EM>>)[],
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
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
