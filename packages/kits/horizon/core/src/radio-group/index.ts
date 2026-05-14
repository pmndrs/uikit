import { custom, object, string } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
export const RadioGroupOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    value: string().optional(),
    onValueChange: custom<(value?: string) => void>((value) => typeof value === 'function').optional(),
    defaultValue: string().optional(),
  }).strict(),
)

export const RadioGroupPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(RadioGroupOutPropertiesSchema),
)

export type RadioGroupOutProperties = BaseOutProperties & z.output<typeof RadioGroupOutPropertiesSchema>

export type RadioGroupProperties = z.input<typeof RadioGroupPropertiesSchema>

export class RadioGroup extends Container<RadioGroupOutProperties> {
  public readonly uncontrolledSignal = signal<string | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue,
  )

  constructor(
    inputProperties?: RadioGroupProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<RadioGroupOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './item.js'
