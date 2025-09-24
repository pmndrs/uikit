import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export type AlertDialogContentOutProperties = BaseOutProperties

export type AlertDialogContentProperties = InProperties<AlertDialogContentOutProperties>

export class AlertDialogContent extends Container<AlertDialogContentOutProperties> {
  constructor(
    inputProperties?: AlertDialogContentProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogContentOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        onClick: (e) => {
          e.stopPropagation?.()
        },
        positionType: 'relative',
        flexDirection: 'column',
        maxWidth: 512,
        width: '100%',
        gap: 16,
        borderWidth: 1,
        backgroundColor: colors.background,
        padding: 24,
        sm: { borderRadius: borderRadius.lg },
        ...config?.defaultOverrides,
      },
    })
  }
}
