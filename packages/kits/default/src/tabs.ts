import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  Properties,
  getProperty,
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
  protected internalResetProperties(inputProperties?: TabsProperties<EM> | undefined): void {
    super.internalResetProperties({
      flexDirection: 'column',
      ...inputProperties,
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
  protected internalResetProperties(inputProperties?: TabsListProperties<EM> | undefined): void {
    super.internalResetProperties({
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: colors.muted,
      padding: 4,
      flexShrink: 0,
      color: colors.mutedForeground,
      ...inputProperties,
    })
  }
}

export type TabsTriggerOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type TabsTriggerNonReactiveProperties = {
  disabled?: boolean
  value?: string
}

export type TabsTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  TabsTriggerOutProperties<EM>,
  TabsTriggerNonReactiveProperties
>

export class TabsTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  TabsTriggerOutProperties<EM>,
  TabsTriggerNonReactiveProperties
> {
  protected internalResetProperties({
    disabled = false,
    value,
    ...rest
  }: TabsTriggerProperties<EM> | undefined = {}): void {
    const active = computed(() => {
      const tabs = this.parentContainer.value
      if (!(tabs instanceof Tabs)) {
        return false
      }
      return value === tabs.getCurrentValueSignal().value
    })

    super.internalResetProperties({
      onClick: disabled
        ? undefined
        : () => {
            const tabs = this.parentContainer.peek()
            if (!(tabs instanceof Tabs)) {
              return
            }
            if (value) {
              const props = tabs.properties.peek()
              if (props.value == null) {
                tabs.getUncontrolledSignal().value = value
              }
              props.onValueChange?.(value)
            }
          },
      cursor: disabled ? undefined : 'pointer',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: borderRadius.sm,
      paddingX: 12,
      backgroundOpacity: disabled ? 0.5 : undefined,
      backgroundColor: computed(() => (active.value ? colors.background.value : undefined)),
      paddingY: 6,
      justifyContent: 'center',
      opacity: disabled ? 0.5 : undefined,
      color: computed(() => (active.value ? colors.foreground.value : undefined)),
      fontSize: 14,
      fontWeight: 'medium',
      lineHeight: 20,
      wordBreak: 'keep-all',
      ...rest,
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
  protected internalResetProperties(inputProperties?: TabsContentProperties<EM> | undefined): void {
    const isVisible = computed(() => {
      const tabs = this.parentContainer.value
      if (!(tabs instanceof Tabs)) {
        return false
      }
      return this.properties.value.value === tabs.getCurrentValueSignal().value
    })

    super.internalResetProperties({
      marginTop: 8,
      display: computed(() => (isVisible.value ? 'flex' : 'none')),
      ...inputProperties,
    })
  }
}

function computeDefaultValue(defaultValue: string | undefined) {
  return signal<string | undefined>(defaultValue)
}

function computeCurrentValue(properties: Properties<TabsOutProperties>, uncontrolled: Signal<string | undefined>) {
  return computed(() => properties.value.value ?? uncontrolled.value)
}
