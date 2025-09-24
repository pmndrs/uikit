import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type AlertDialogHeaderOutProperties = BaseOutProperties

export type AlertDialogHeaderProperties = InProperties<AlertDialogHeaderOutProperties>

export class AlertDialogHeader extends Container<AlertDialogHeaderOutProperties> {
  constructor(
    inputProperties?: AlertDialogHeaderProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogHeaderOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'column',
        gap: 6,
        ...config?.defaultOverrides,
      },
    })
  }
}
