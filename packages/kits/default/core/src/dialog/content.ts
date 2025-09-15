import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'
import { XIcon } from '@pmndrs/uikit-lucide'
import { Dialog } from './index.js'
import { searchFor } from '../utils.js'

export type DialogContentOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type DialogContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DialogContentOutProperties<EM>
>

export class DialogContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogContentOutProperties<EM>
> {
  public readonly closeButton: XIcon

  constructor(
    inputProperties?: DialogContentProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogContentOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
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

    this.closeButton = new XIcon({
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

  dispose(): void {
    this.closeButton.dispose()
    super.dispose()
  }

  private closeDialog() {
    const dialog = searchFor(this, Dialog, 2)
    if (dialog == null) {
      throw new Error(`DialogContent must be a decendant of Dialog (max 2 steps deep)`)
    }
    dialog.setOpen(false)
  }
}
