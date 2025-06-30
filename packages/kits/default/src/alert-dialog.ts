import {
  Container,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  readReactive,
  RenderContext,
  withOpacity,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'
import { Dialog, DialogProperties } from './dialog.js'

export type AlertDialogProperties<EM extends ThreeEventMap = ThreeEventMap> = DialogProperties<EM>

export class AlertDialog<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Dialog<T, EM> {}

export type AlertDialogTriggerOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type AlertDialogTriggerNonReactiveProperties = {
  dialog?: AlertDialog
}

export type AlertDialogTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  AlertDialogTriggerOutProperties<EM>,
  AlertDialogTriggerNonReactiveProperties
>

export class AlertDialogTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AlertDialogTriggerOutProperties<EM>,
  AlertDialogTriggerNonReactiveProperties
> {
  protected internalResetProperties({ onClick, dialog, ...props }: AlertDialogTriggerProperties<EM> = {}): void {
    super.internalResetProperties({
      onClick: computed(() => (e: any) => {
        dialog?.setOpen(true)
        readReactive(onClick)?.(e)
      }),
      cursor: 'pointer',
      ...props,
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
  protected internalResetProperties({ onClick, sm, ...props }: AlertDialogContentProperties<EM> = {}): void {
    super.internalResetProperties({
      onClick: computed(() => (e: any) => {
        e.stopPropagation()
        readReactive(onClick)?.(e)
      }),
      positionType: 'relative',
      flexDirection: 'column',
      maxWidth: 512,
      width: '100%',
      gap: 16,
      borderWidth: 1,
      backgroundColor: colors.background,
      padding: 24,
      sm: { borderRadius: borderRadius.lg, ...sm },
      ...props,
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
  protected internalResetProperties(props: AlertDialogHeaderProperties<EM> = {}): void {
    super.internalResetProperties({
      flexDirection: 'column',
      gap: 6,
      ...props,
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
  protected internalResetProperties({ sm, ...props }: AlertDialogFooterProperties<EM> = {}): void {
    super.internalResetProperties({
      flexDirection: 'column-reverse',
      sm: { flexDirection: 'row', justifyContent: 'flex-end', ...sm },
      gap: 8,
      ...props,
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
  protected internalResetProperties(props: AlertDialogTitleProperties<EM> = {}): void {
    super.internalResetProperties({
      fontSize: 18,
      lineHeight: '28px',
      fontWeight: 'semi-bold',
      ...props,
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
  protected internalResetProperties(props: AlertDialogDescriptionProperties<EM> = {}): void {
    super.internalResetProperties({
      fontSize: 14,
      lineHeight: '20px',
      color: colors.mutedForeground,
      ...props,
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
  protected internalResetProperties({ onClick, ...props }: AlertDialogActionProperties<EM> = {}): void {
    super.internalResetProperties({
      borderRadius: borderRadius.md,
      height: 40,
      paddingX: 16,
      paddingY: 8,
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flexDirection: 'row',
      backgroundColor: colors.primary,
      onClick: computed(() => (e: any) => {
        e.stopPropagation()
        this.closeDialog()
        const originalOnClick = onClick
        if (typeof originalOnClick === 'function') {
          originalOnClick(e)
        }
      }),
      hover: {
        backgroundColor: withOpacity(colors.primary, 0.9),
      },
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 'medium',
      wordBreak: 'keep-all',
      color: colors.primaryForeground,
      ...props,
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
  protected internalResetProperties({ onClick, ...props }: AlertDialogCancelProperties<EM> = {}): void {
    super.internalResetProperties({
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
      onClick: computed(() => (e: any) => {
        e.stopPropagation()
        this.closeDialog()
        const originalOnClick = onClick
        if (typeof originalOnClick === 'function') {
          originalOnClick(e)
        }
      }),
      hover: {
        backgroundColor: colors.accent,
      },
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 'medium',
      wordBreak: 'keep-all',
      ...props,
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
