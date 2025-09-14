import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'
import { AlertDialog } from './index.js'
import { searchFor } from '../utils.js'

export type AlertDialogCancelOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogCancelProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogCancelOutProperties<EM>
>

export class AlertDialogCancel<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogCancelOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogCancelProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogCancelOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
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
