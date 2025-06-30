import {
  Container,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  Properties,
  getProperty,
  RenderContext,
  readReactive,
  withOpacity,
} from '@pmndrs/uikit'
import { signal, computed, Signal } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'
import { X } from '@pmndrs/uikit-lucide'

export type DialogOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
} & BaseOutProperties<EM>

export type DialogProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<DialogOutProperties<EM>>

export class Dialog<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogOutProperties<EM>
> {
  protected internalResetProperties(props: DialogProperties<EM> = {}): void {
    // Get the open state signal
    const isOpen = this.getCurrentOpenSignal()

    super.internalResetProperties({
      onPointerMove: (e: any) => e.stopPropagation(),
      onPointerEnter: (e: any) => e.stopPropagation(),
      onPointerLeave: (e: any) => e.stopPropagation(),
      onWheel: (e: any) => e.stopPropagation(),
      positionType: 'absolute',
      display: computed(() => (isOpen.value ? 'flex' : 'none')),
      inset: 0,
      zIndex: 50,
      backgroundColor: withOpacity('black', 0.8),
      alignItems: 'center',
      justifyContent: 'center',
      onClick: (e: any) => {
        this.setOpen(false)
        e.stopPropagation()
      },
      ...props,
    })
  }

  private getUncontrolledSignal() {
    return getProperty(this, 'uncontrolled', () => computeDefaultOpen(this.properties.peek().defaultOpen))
  }

  private getCurrentOpenSignal() {
    return getProperty(this, 'currentOpen', () => computeCurrentOpen(this.properties, this.getUncontrolledSignal()))
  }

  setOpen(open: boolean) {
    const props = this.properties.peek()
    if (props.open == null) {
      this.getUncontrolledSignal().value = open
    }
    props.onOpenChange?.(open)
  }
}

export type DialogContentOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DialogContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DialogContentOutProperties<EM>
>

export class DialogContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogContentOutProperties<EM>
> {
  private closeButton: InstanceType<typeof X>

  constructor(
    inputProperties?: DialogContentProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext)

    // Create close button
    this.closeButton = new X({
      color: colors.mutedForeground,
      onClick: () => this.closeDialog(),
      cursor: 'pointer',
      positionType: 'absolute',
      zIndex: 50,
      positionRight: 16,
      positionTop: 16,
      borderRadius: 2,
      opacity: 0.7,
      hover: { opacity: 1 },
      width: 16,
      height: 16,
    })

    // Add close button to this content
    this.add(this.closeButton)
  }

  protected internalResetProperties({ sm, ...props }: DialogContentProperties<EM> = {}): void {
    super.internalResetProperties({
      onClick: (e: any) => e.stopPropagation(),
      positionType: 'relative',
      flexDirection: 'column',
      width: '100%',
      gap: 16,
      borderWidth: 1,
      backgroundColor: colors.background,
      padding: 24,
      sm: { borderRadius: borderRadius.lg, ...sm },
      ...props,
    })
  }

  private closeDialog() {
    const dialog = this.parentContainer.value
    if (!(dialog instanceof Dialog)) {
      throw new Error(`DialogContent must be a child of Dialog`)
    }
    dialog.setOpen(false)
  }
}

export type DialogTriggerOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DialogTriggerNonReactiveProperties = {
  dialog?: Dialog
}

export type DialogTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DialogTriggerOutProperties<EM>,
  DialogTriggerNonReactiveProperties
>

export class DialogTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogTriggerOutProperties<EM>
> {
  protected internalResetProperties({ onClick, dialog, ...props }: DialogTriggerProperties<EM> = {}): void {
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

export type DialogHeaderOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DialogHeaderProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DialogHeaderOutProperties<EM>
>

export class DialogHeader<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogHeaderOutProperties<EM>
> {
  protected internalResetProperties(props: DialogHeaderProperties<EM> = {}): void {
    super.internalResetProperties({
      flexDirection: 'column',
      gap: 6,
      ...props,
    })
  }
}

export type DialogFooterOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DialogFooterProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DialogFooterOutProperties<EM>
>

export class DialogFooter<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogFooterOutProperties<EM>
> {
  protected internalResetProperties({ sm, ...props }: DialogFooterProperties<EM> = {}): void {
    super.internalResetProperties({
      flexDirection: 'column-reverse',
      sm: { flexDirection: 'row', justifyContent: 'flex-end', ...sm },
      gap: 8,
      ...props,
    })
  }
}

function computeDefaultOpen(defaultOpen: boolean | undefined) {
  return signal<boolean>(defaultOpen ?? false)
}

function computeCurrentOpen(properties: Properties<DialogOutProperties>, uncontrolled: Signal<boolean>) {
  return computed(() => properties.value.open ?? uncontrolled.value)
}
