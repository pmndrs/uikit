import { custom, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import type { Dialog } from './index.js'
import { colors, componentDefaults } from '../theme.js'
export const DialogTriggerOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    dialog: custom<Dialog>(() => true).optional(),
  }).strict(),
)

export const DialogTriggerPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(DialogTriggerOutPropertiesSchema),
)

export type DialogTriggerOutProperties = BaseOutProperties & z.output<typeof DialogTriggerOutPropertiesSchema>

export type DialogTriggerProperties = z.input<typeof DialogTriggerPropertiesSchema>

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
