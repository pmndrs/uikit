import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { AlertDialog } from './index.js'
import { colors, componentDefaults } from '../theme.js'

export type AlertDialogTriggerOutProperties = BaseOutProperties & {
  dialog?: AlertDialog
}

export type AlertDialogTriggerProperties = InProperties<AlertDialogTriggerOutProperties>

export class AlertDialogTrigger extends Container<AlertDialogTriggerOutProperties> {
  constructor(
    inputProperties?: AlertDialogTriggerProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<AlertDialogTriggerOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        onClick: () => {
          this.properties.peek().dialog?.setOpen(true)
        },
        cursor: 'pointer',
        ...config?.defaultOverrides,
      },
    })
  }
}
