import { number, object, string, union } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties, RenderContext, searchFor } from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'
import { computed } from '@preact/signals-core'
import { Tooltip } from './index.js'
export const TooltipContentOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    sideOffset: union([number(), string()]).optional(),
  }).strict(),
)

export const TooltipContentPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(TooltipContentOutPropertiesSchema),
)

export type TooltipContentOutProperties = BaseOutProperties & z.output<typeof TooltipContentOutPropertiesSchema>

export type TooltipContentProperties = z.input<typeof TooltipContentPropertiesSchema>

export class TooltipContent extends Container<TooltipContentOutProperties> {
  constructor(
    inputProperties?: TooltipContentProperties,
    initialClasses?: Array<InProperties<TooltipContentOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<TooltipContentOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        positionType: 'absolute',
        positionBottom: '100%',
        marginBottom: computed(() => Number(this.properties.value.sideOffset ?? 4)),
        zIndex: 50,
        overflow: 'hidden',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        backgroundColor: colors.popover,
        paddingX: 12,
        paddingY: 6,
        wordBreak: 'keep-all',
        fontSize: 14,
        lineHeight: '20px',
        color: colors.popoverForeground,
        display: computed(() => (searchFor(this, Tooltip, 2)?.open.value ? 'flex' : 'none')),
        ...config?.defaultOverrides,
      },
    })
  }
}
