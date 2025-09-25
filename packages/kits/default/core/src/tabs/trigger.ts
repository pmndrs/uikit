import { Container, InProperties, BaseOutProperties, RenderContext, searchFor } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Tabs } from './index.js'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export type TabsTriggerOutProperties = BaseOutProperties & {
  disabled?: boolean
  value?: string
}

export type TabsTriggerProperties = InProperties<TabsTriggerOutProperties>

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
