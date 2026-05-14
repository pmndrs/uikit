import { enum as enumSchema, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'
import { computed } from '@preact/signals-core'
const _alertVariants = {
  default: {
    backgroundColor: colors.card,
    color: colors.cardForeground,
  },
  destructive: {
    backgroundColor: colors.card,
    color: colors.destructive,
  },
} satisfies { [Key in string]: ContainerProperties }
const alertVariants = _alertVariants as UnionizeVariants<typeof _alertVariants>

export const AlertOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    variant: enumSchema(
      Object.keys(alertVariants) as [keyof typeof alertVariants, ...(keyof typeof alertVariants)[]],
    ).optional(),
  }).strict(),
)

export const AlertPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(AlertOutPropertiesSchema),
)

export type AlertOutProperties = BaseOutProperties & z.output<typeof AlertOutPropertiesSchema>

export type AlertProperties = z.input<typeof AlertPropertiesSchema>

export class Alert extends Container<AlertOutProperties> {
  constructor(
    inputProperties?: InProperties<AlertOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AlertOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'column',
        positionType: 'relative',
        width: '100%',
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        padding: 16,
        backgroundColor: computed(
          () => alertVariants[this.properties.value.variant ?? 'default'].backgroundColor?.value,
        ),
        color: computed(() => alertVariants[this.properties.value.variant ?? 'default'].color?.value),
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './icon.js'
export * from './title.js'
export * from './description.js'
