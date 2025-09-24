import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type AlertDialogTitleOutProperties = BaseOutProperties

export type AlertDialogTitleProperties = InProperties<AlertDialogTitleOutProperties>

export class AlertDialogTitle extends Container<AlertDialogTitleOutProperties> {
  constructor(
    inputProperties?: AlertDialogTitleProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogTitleOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        fontSize: 18,
        lineHeight: '28px',
        fontWeight: 'semi-bold',
        ...config?.defaultOverrides,
      },
    })
  }
}
