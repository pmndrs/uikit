import { InProperties, BaseOutProperties, Container, ThreeEventMap, RenderContext } from '@pmndrs/uikit'
import { Check } from '@pmndrs/uikit-lucide'
import { signal, computed } from '@preact/signals-core'
import { borderRadius, colors, componentDefaults, contentDefaults } from '../theme.js'

export type CheckboxOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  checked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  defaultChecked?: boolean
}

export type CheckboxProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<CheckboxOutProperties<EM>>

export class Checkbox<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  CheckboxOutProperties<EM>
> {
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.checked ?? this.uncontrolledSignal.value ?? this.properties.value.defaultChecked,
  )
  public readonly icon!: InstanceType<typeof Check>

  constructor(
    inputProperties?: InProperties<CheckboxOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<CheckboxOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        alignItems: 'center',
        justifyContent: 'center',
        cursor: computed(() => (this.properties.value.disabled ? undefined : 'pointer')),
        onClick: () => {
          if (this.properties.peek().disabled) {
            return
          }
          const checked = this.currentSignal.peek()
          if (this.properties.peek().checked == null) {
            this.uncontrolledSignal.value = !checked
          }
          this.properties.peek().onCheckedChange?.(!checked)
        },
        borderRadius: borderRadius.sm,
        width: 16,
        height: 16,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: computed(() => (this.currentSignal.value ? colors.primary.value : undefined)),
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        disabled: computed(() => this.properties.value.disabled),
        ...config?.defaultOverrides,
      },
    })

    super.add(
      (this.icon = new Check(undefined, undefined, {
        defaults: contentDefaults,
        defaultOverrides: {
          color: computed(() => (this.currentSignal.value ? colors.primaryForeground.value : undefined)),
          opacity: computed(() => (this.currentSignal.value ? (this.properties.value.disabled ? 0.5 : undefined) : 0)),
          width: 14,
          height: 14,
        },
      })),
    )
  }

  add(): this {
    throw new Error(`the checkbox component can not have any children`)
  }
}
