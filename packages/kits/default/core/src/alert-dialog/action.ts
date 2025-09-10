import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext, withOpacity } from '@pmndrs/uikit'
import { borderRadius, colors } from '../theme.js'
import { AlertDialog } from './index.js'
import { AlertDialogFooter } from './footer.js'
import { AlertDialogContent } from './content.js'

export type AlertDialogActionOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogActionProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogActionOutProperties<EM>
>

export class AlertDialogAction<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogActionOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogActionProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogActionOutProperties<EM>> },
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
        backgroundColor: colors.primary,
        onClick: (e: any) => {
          e.stopPropagation()
          this.closeDialog()
          const originalOnClick = this.properties.peek().onClick as any
          if (typeof originalOnClick === 'function') {
            originalOnClick(e)
          }
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
    const footer = this.parentContainer.value
    if (!(footer instanceof AlertDialogFooter)) {
      throw new Error(`AlertDialogAction must be a child of AlertDialogFooter`)
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
