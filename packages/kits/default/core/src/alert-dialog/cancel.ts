import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors } from '../theme.js'
import { AlertDialog } from './index.js'
import { AlertDialogFooter } from './footer.js'
import { AlertDialogContent } from './content.js'

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
          this.properties.peek().onClick?.(e)
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
    const footer = this.parentContainer.value
    if (!(footer instanceof AlertDialogFooter)) {
      throw new Error(`AlertDialogCancel must be a child of AlertDialogFooter`)
    }

    const content = footer.parentContainer.value
    if (!(content instanceof AlertDialogContent)) {
      throw new Error(`AlertDialogFooter must be a child of AlertDialogContent`)
    }

    const dialog = content.parentContainer.value
    if (!(dialog instanceof AlertDialog)) {
      throw new Error(`AlertDialogContent must be a child of AlertDialog`)
    }

    dialog.setOpen(false)
  }
}
