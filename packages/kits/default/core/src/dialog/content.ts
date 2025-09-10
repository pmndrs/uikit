import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors } from '../theme.js'
import { X } from '@pmndrs/uikit-lucide'
import { Dialog } from './index.js'

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
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogContentOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        onClick: (e: any) => e.stopPropagation(),
        positionType: 'relative',
        flexDirection: 'column',
        width: '100%',
        gap: 16,
        borderWidth: 1,
        backgroundColor: colors.background,
        padding: 24,
        sm: { borderRadius: borderRadius.lg },
        ...config?.defaultOverrides,
      },
    })

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

    this.add(this.closeButton)
  }

  private closeDialog() {
    const dialog = this.parentContainer.value
    if (!(dialog instanceof Dialog)) {
      throw new Error(`DialogContent must be a child of Dialog`)
    }
    dialog.setOpen(false)
  }
}
