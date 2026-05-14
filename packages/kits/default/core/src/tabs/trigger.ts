import { boolean, object, string } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, RenderContext, searchFor } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Tabs } from './index.js'
import { borderRadius, colors, componentDefaults } from '../theme.js'
export const TabsTriggerOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    disabled: boolean().optional(),
    value: string().optional(),
  }).strict(),
)

export const TabsTriggerPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(TabsTriggerOutPropertiesSchema),
)

export type TabsTriggerOutProperties = BaseOutProperties & z.output<typeof TabsTriggerOutPropertiesSchema>

export type TabsTriggerProperties = z.input<typeof TabsTriggerPropertiesSchema>

export class TabsTrigger extends Container<TabsTriggerOutProperties> {
  constructor(
    inputProperties?: InProperties<TabsTriggerOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<TabsTriggerOutProperties>
    },
  ) {
    const active = computed(() => {
      const tabs = searchFor(this, Tabs, 3)
      return this.properties.value.value === tabs?.currentSignal.value
    })
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        onClick: computed(() => {
          return (this.properties.value.disabled ?? false)
            ? undefined
            : () => {
                const tabs = searchFor(this, Tabs, 3)
                if (tabs == null) {
                  return
                }
                const val = this.properties.peek().value
                if (val) {
                  const props = tabs.properties.peek()
                  if (props.value == null) {
                    tabs.uncontrolledSignal.value = val
                  }
                  props.onValueChange?.(val)
                }
              }
        }),
        cursor: computed(() => (this.properties.value.disabled ? undefined : 'pointer')),
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        paddingX: 12,
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        disabled: computed(() => this.properties.value.disabled),
        backgroundColor: computed(() => (active.value ? colors.background.value : undefined)),
        paddingY: 6,
        justifyContent: 'center',
        color: computed(() => (active.value ? colors.foreground.value : undefined)),
        fontSize: 14,
        fontWeight: 'medium',
        lineHeight: '20px',
        wordBreak: 'keep-all',
        ...config?.defaultOverrides,
      },
    })
  }
}
