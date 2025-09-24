import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type AlertDialogFooterOutProperties = BaseOutProperties

export type AlertDialogFooterProperties = InProperties<AlertDialogFooterOutProperties>

export class AlertDialogFooter extends Container<AlertDialogFooterOutProperties> {
  constructor(
    inputProperties?: AlertDialogFooterProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogFooterOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'column-reverse',
        sm: { flexDirection: 'row', justifyContent: 'flex-end' },
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
  }
}
