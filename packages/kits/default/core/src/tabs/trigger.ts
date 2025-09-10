import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { Tabs } from './index.js'
import { borderRadius, colors } from '../theme.js'

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
      const tabs = this.parentContainer.value
      if (!(tabs instanceof Tabs)) {
        return false
      }
      const val = this.properties.signal.value?.value
      return val != null && val === tabs.getCurrentValueSignal().value
    })
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        onClick: computed(() => {
          return this.properties.signal.disabled?.value
            ? undefined
            : () => {
                const tabs = this.parentContainer.peek()
                if (!(tabs instanceof Tabs)) {
                  return
                }
                const val = this.properties.peek().value
                if (val) {
                  const props = tabs.properties.peek()
                  if (props.value == null) {
                    tabs.getUncontrolledSignal().value = val
                  }
                  props.onValueChange?.(val)
                }
              }
        }),
        cursor: computed(() => (this.properties.signal.disabled?.value ? undefined : 'pointer')),
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.sm,
        paddingX: 12,
        opacity: computed(() => (this.properties.signal.disabled?.value ? 0.5 : undefined)),
        disabled: computed(() => this.properties.signal.disabled?.value),
        backgroundColor: computed(() => (active.value ? colors.background.value : undefined)),
        paddingY: 6,
        justifyContent: 'center',
        color: computed(() => (active.value ? colors.foreground.value : undefined)),
        fontSize: 14,
        fontWeight: 'medium',
        lineHeight: '20px',
        wordBreak: 'keep-all',
        ...config?.defaultOverrides,
      } as InProperties<TabsTriggerOutProperties<EM>>,
    })
  }
}


