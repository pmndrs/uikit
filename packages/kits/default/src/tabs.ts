import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  Properties,
  getProperty,
  RenderContext,
} from '@pmndrs/uikit'
import { signal, computed, Signal } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'

export type TabsOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export type TabsProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<TabsOutProperties<EM>>

export class Tabs<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, TabsOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<TabsOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TabsOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        ...config?.defaultOverrides,
      },
    })
  }

  getUncontrolledSignal() {
    return getProperty(this, 'uncontrolled', () => computeDefaultValue(this.properties.peek().defaultValue))
  }

  getCurrentValueSignal() {
    return getProperty(this, 'currentValue', () => computeCurrentValue(this.properties, this.getUncontrolledSignal()))
  }
}

export type TabsListProperties<EM extends ThreeEventMap = ThreeEventMap> = ContainerProperties<EM>

export class TabsList<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        backgroundColor: colors.muted,
        padding: 4,
        flexShrink: 0,
        color: colors.mutedForeground,
        ...config?.defaultOverrides,
      },
    })
  }
}

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

export type TabsContentOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value: string
}

export type TabsContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<TabsContentOutProperties<EM>>

export class TabsContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  TabsContentOutProperties<EM>
> {
  constructor(
    inputProperties?: TabsContentProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TabsContentOutProperties<EM>> },
  ) {
    const isVisible = computed(() => {
      const tabs = this.parentContainer.value
      if (!(tabs instanceof Tabs)) {
        return false
      }
      return this.properties.value.value === tabs.getCurrentValueSignal().value
    })
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        marginTop: 8,
        display: computed(() => (isVisible.value ? 'flex' : 'none')),
        ...config?.defaultOverrides,
      } as InProperties<TabsContentOutProperties<EM>>,
    })
  }
}

function computeDefaultValue(defaultValue: string | undefined) {
  return signal<string | undefined>(defaultValue)
}

function computeCurrentValue(properties: Properties<TabsOutProperties>, uncontrolled: Signal<string | undefined>) {
  return computed(() => properties.value.value ?? uncontrolled.value)
}
