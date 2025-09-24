import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type AlertDialogDescriptionOutProperties = BaseOutProperties

export type AlertDialogDescriptionProperties = InProperties<AlertDialogDescriptionOutProperties>

export class AlertDialogDescription extends Container<AlertDialogDescriptionOutProperties> {
  constructor(
    inputProperties?: AlertDialogDescriptionProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AlertDialogDescriptionOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        fontSize: 14,
        lineHeight: '20px',
        color: colors.mutedForeground,
        ...config?.defaultOverrides,
      },
    })
  }
}
