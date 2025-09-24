import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'
import { AlertDialog } from './index.js'
import { searchFor } from '../utils.js'

export type AlertDialogCancelOutProperties = BaseOutProperties

export type AlertDialogCancelProperties = InProperties<AlertDialogCancelOutProperties>

export class AlertDialogCancel extends Container<AlertDialogCancelOutProperties> {
  constructor(
    inputProperties?: AlertDialogCancelProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogCancelOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        borderRadius: borderRadius.md,
        height: 40,
        paddingX: 16,
        paddingY: 8,
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.input,
        backgroundColor: colors.background,
        onClick: (e: any) => {
          e.stopPropagation()
          this.closeDialog()
        },
        hover: {
          backgroundColor: colors.accent,
        },
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 'medium',
        wordBreak: 'keep-all',
        ...config?.defaultOverrides,
      },
    })
  }

  private closeDialog() {
    const dialog = searchFor(this, AlertDialog, 5)
    if (dialog == null) {
      throw new Error(`AlertDialogAction must be a decendant of AlertDialog (max 5 steps deep)`)
    }
    dialog.setOpen(false)
  }
}
