import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'

import { AlertDialog } from './index.js'

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
        onClick: () => {
          this.properties.peek().dialog?.setOpen(true)
        },
        cursor: 'pointer',
        ...config?.defaultOverrides,
      },
    })
  }
}
