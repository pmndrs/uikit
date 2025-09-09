import { InProperties, BaseOutProperties, Container, getProperty, ThreeEventMap, RenderContext } from '@pmndrs/uikit'
import { Check } from '@pmndrs/uikit-lucide'
import { signal, computed, Signal } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'

export type CheckboxOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  checked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  defaultChecked?: boolean
}

export type CheckboxProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<CheckboxOutProperties<EM>>

export class Checkbox<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends CheckboxOutProperties<EM> = CheckboxOutProperties<EM>,
> extends Container<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        alignItems: 'center',
        justifyContent: 'center',
        cursor: computed(() => (this.properties.signal.disabled?.value ? undefined : 'pointer')),
        onClick: () => {
          if (this.properties.peek().disabled) {
            return
          }
          const checked = this.getCheckedSignal().peek()
          if (this.properties.peek().checked == null) {
            this.getUncontrolledSignal().value = !checked
          }
          this.properties.peek().onCheckedChange?.(!checked)
        },
        borderRadius: borderRadius.sm,
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: computed(() => (this.getCheckedSignal().value ? colors.primary.value : undefined)),
        opacity: computed(() => (this.properties.signal.disabled?.value ? 0.5 : undefined)),
        disabled: computed(() => this.properties.signal.disabled?.value),
        ...config?.defaultOverrides,
      } as InProperties<OutProperties>,
    })

    const checked = this.getCheckedSignal()
    super.add(
      new Check({
        color: computed(() => (checked.value ? colors.primaryForeground.value : undefined)),
        opacity: computed(() => (checked.value ? (this.properties.value.disabled ? 0.5 : undefined) : 0)),
        width: 14,
        height: 14,
      }),
    )
  }

  add(): this {
    throw new Error(`the checkbox component can not have any children`)
  }

  private getUncontrolledSignal() {
    return getProperty(this, 'uncontrolled', () => signal(this.properties.peek().defaultChecked ?? false))
  }

  private getCheckedSignal() {
    const uncontrolled = this.getUncontrolledSignal()
    return getProperty(this, 'checked', () => computed(() => this.properties.value.checked ?? uncontrolled.value))
  }
}
