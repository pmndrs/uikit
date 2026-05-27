import { object } from 'zod'
import type { z } from 'zod'
import {
  BaseOutProperties,
  Container,
  InProperties,
  RenderContext,
  baseOutPropertyShape,
  createInPropertiesSchema,
  defineSchema,
  numberOrPercentageValueSchema,
  type NumberOrPercentageValue,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { theme } from '../theme.js'
export const ProgressBarOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    value: numberOrPercentageValueSchema.optional(),
  }).strict(),
)

export const ProgressBarPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(ProgressBarOutPropertiesSchema),
)

export type ProgressBarOutProperties = BaseOutProperties & z.output<typeof ProgressBarOutPropertiesSchema>

export type ProgressBarProperties = z.input<typeof ProgressBarPropertiesSchema>

function formatProgressWidth(value: NumberOrPercentageValue | undefined): `${number}%` {
  if (value == null) {
    return '0%'
  }
  if (typeof value === 'string' && value.endsWith('%')) {
    return value as `${number}%`
  }
  return `${Number(value)}%`
}

export class ProgressBar extends Container<ProgressBarOutProperties> {
  public readonly fill: Container
  constructor(
    inputProperties?: InProperties<ProgressBarOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ProgressBarOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        borderRadius: 1000,
        height: 12,
        backgroundColor: theme.component.progressBar.determinate.background.background.value,
        ...config?.defaultOverrides,
      },
    })
    super.add(
      (this.fill = new Container(undefined, undefined, {
        defaultOverrides: {
          height: 12,
          borderRadius: 1000,
          backgroundColor: theme.component.progressBar.determinate.fill.fill.value,
          width: computed(() => formatProgressWidth(this.properties.value.value)),
          minWidth: 12,
        },
      })),
    )
  }

  dispose(): void {
    this.fill.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the ProgressBar component can not have any children`)
  }
}

export * from './stepper.js'
export * from './stepper-step.js'
