import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import type { Dialog } from './index.js'
import { colors, componentDefaults } from '../theme.js'

export type DialogTriggerOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  dialog?: Dialog
}

export type DialogTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  DialogTriggerOutProperties<EM>
>

export class DialogTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  DialogTriggerOutProperties<EM>
> {
  constructor(
    inputProperties?: DialogTriggerProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<DialogTriggerOutProperties<EM>> },
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
