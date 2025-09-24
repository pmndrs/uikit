import { Container, InProperties, BaseOutProperties, RenderContext, withOpacity } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'
import { AlertDialog } from './index.js'
import { searchFor } from '../utils.js'

export type AlertDialogActionOutProperties = BaseOutProperties

export type AlertDialogActionProperties = InProperties<AlertDialogActionOutProperties>

export class AlertDialogAction extends Container<AlertDialogActionOutProperties> {
  constructor(
    inputProperties?: AlertDialogActionProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogActionOutProperties> },
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
        backgroundColor: colors.primary,
        onClick: (e) => {
          e.stopPropagation?.()
          this.closeDialog()
        },
        hover: {
          backgroundColor: withOpacity(colors.primary, 0.9),
        },
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 'medium',
        wordBreak: 'keep-all',
        color: colors.primaryForeground,
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
