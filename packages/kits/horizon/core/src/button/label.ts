import type { z } from 'zod'
import { ContainerPropertiesSchema } from '@pmndrs/uikit'
import {
  BaseOutProperties,
  componentDefaults,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  WithSignal,
} from '@pmndrs/uikit'
export const ButtonLabelPropertiesSchema = ContainerPropertiesSchema

export type ButtonLabelProperties = z.input<typeof ButtonLabelPropertiesSchema>

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
