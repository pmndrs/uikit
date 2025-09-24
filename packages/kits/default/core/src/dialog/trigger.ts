import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import type { Dialog } from './index.js'
import { colors, componentDefaults } from '../theme.js'

export type DialogTriggerOutProperties = BaseOutProperties & {
  dialog?: Dialog
}

export type DialogTriggerProperties = InProperties<DialogTriggerOutProperties>

export class DialogTrigger extends Container<DialogTriggerOutProperties> {
  constructor(
    inputProperties?: DialogTriggerProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<DialogTriggerOutProperties> },
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
