import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Tabs, TabsList } from './index.js'
import { borderRadius, colors, componentDefaults } from '../theme.js'
import { PhoneForwarded } from '@pmndrs/uikit-lucide'
import { searchFor } from '../utils.js'

export type TabsTriggerOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  disabled?: boolean
  value?: string
}

export type TabsTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<TabsTriggerOutProperties<EM>>

export class TabsTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  TabsTriggerOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<TabsTriggerOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<TabsTriggerOutProperties<EM>>
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
