import { Container, ThreeEventMap, InProperties, BaseOutProperties, withOpacity, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors } from './theme.js'
import { Dialog, DialogProperties } from './dialog.js'

export type AlertDialogProperties<EM extends ThreeEventMap = ThreeEventMap> = DialogProperties<EM>

export class AlertDialog<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Dialog<T, EM> {}

export type AlertDialogTriggerOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  dialog?: AlertDialog
}

export type AlertDialogTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogTriggerOutProperties<EM>
>

export class AlertDialogTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogTriggerOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogTriggerProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogTriggerOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        onClick: (event) => {
          this.properties.peek().dialog?.setOpen(true)
          this.properties.peek().onClick?.(event)
        },
        cursor: 'pointer',
        ...config?.defaultOverrides,
      },
    })
  }
}

export type AlertDialogContentOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogContentOutProperties<EM>
>

export class AlertDialogContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogContentOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogContentProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogContentOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        onClick: (e) => {
          e.stopPropagation?.()
          this.properties.peek().onClick?.(e)
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

export type AlertDialogHeaderOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogHeaderProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogHeaderOutProperties<EM>
>

export class AlertDialogHeader<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogHeaderOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogHeaderProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogHeaderOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        gap: 6,
        ...config?.defaultOverrides,
      },
    })
  }
}

export type AlertDialogFooterOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogFooterProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogFooterOutProperties<EM>
>

export class AlertDialogFooter<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogFooterOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogFooterProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogFooterOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column-reverse',
        sm: { flexDirection: 'row', justifyContent: 'flex-end' },
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
  }
}

export type AlertDialogTitleOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogTitleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogTitleOutProperties<EM>
>

export class AlertDialogTitle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogTitleOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogTitleProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogTitleOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        fontSize: 18,
        lineHeight: '28px',
        fontWeight: 'semi-bold',
        ...config?.defaultOverrides,
      },
    })
  }
}

export type AlertDialogDescriptionOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogDescriptionProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogDescriptionOutProperties<EM>
>

export class AlertDialogDescription<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogDescriptionOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDialogDescriptionProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AlertDialogDescriptionOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        fontSize: 14,
        lineHeight: '20px',
        color: colors.mutedForeground,
        ...config?.defaultOverrides,
      },
    })
  }
}

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
    // Traverse up the hierarchy: this -> footer -> content -> dialog
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
          const originalOnClick = this.properties.peek().onClick as any
          if (typeof originalOnClick === 'function') {
            originalOnClick(e)
          }
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
    // Traverse up the hierarchy: this -> footer -> content -> dialog
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
