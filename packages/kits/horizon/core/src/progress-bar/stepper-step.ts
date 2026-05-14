import { boolean, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { theme } from '../theme.js'
export const ProgressBarStepperStepOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    value: boolean().optional(),
  }).strict(),
)

export const ProgressBarStepperStepPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(ProgressBarStepperStepOutPropertiesSchema),
)

export type ProgressBarStepperStepOutProperties = BaseOutProperties &
  z.output<typeof ProgressBarStepperStepOutPropertiesSchema>

export type ProgressBarStepperStepProperties = z.input<typeof ProgressBarStepperStepPropertiesSchema>

export class ProgressBarStepperStep extends Container<ProgressBarStepperStepOutProperties> {
  constructor(
    inputProperties?: InProperties<ProgressBarStepperStepOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ProgressBarStepperStepOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        borderRadius: 1000,
        height: 12,
        flexGrow: 1,
        backgroundColor: computed(() =>
          this.properties.value.value
            ? theme.component.progressBar.determinate.fill.fill.value
            : theme.component.progressBar.determinate.background.background.value,
        ),
        ...config?.defaultOverrides,
      },
    })
  }

  add(): this {
    throw new Error(`the ProgressBarStepperStep component can not have any children`)
  }
}
