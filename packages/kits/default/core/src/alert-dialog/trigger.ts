import { custom, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { AlertDialog } from './index.js'
import { colors, componentDefaults } from '../theme.js'
export const AlertDialogTriggerOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    dialog: custom<AlertDialog>(() => true).optional(),
  }).strict(),
)

export const AlertDialogTriggerPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(AlertDialogTriggerOutPropertiesSchema),
)

export type AlertDialogTriggerOutProperties = BaseOutProperties & z.output<typeof AlertDialogTriggerOutPropertiesSchema>

export type AlertDialogTriggerProperties = z.input<typeof AlertDialogTriggerPropertiesSchema>

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
