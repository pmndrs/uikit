import { BaseOutProperties, Container, ContainerProperties, InProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type AccordionTriggerProperties = ContainerProperties

export class AccordionTrigger extends Container {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides: InProperties<BaseOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'row',
        flexGrow: 1,
        flexShrink: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        paddingBottom: 16,
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 'medium',
        ...config?.defaultOverrides,
      },
    })
  }
}
