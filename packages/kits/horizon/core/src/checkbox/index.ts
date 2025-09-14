import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { Check } from '@pmndrs/uikit-lucide'
import { computed, signal } from '@preact/signals-core'
import { lightTheme } from '../theme.js'

//TODO: variant "onMedia"

export type CheckboxOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  checked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  defaultChecked?: boolean
}

export class Checkbox<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  CheckboxOutProperties<EM>
> {
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.checked ?? this.uncontrolledSignal.value ?? this.properties.value.defaultChecked,
  )

  constructor(
    inputProperties?: InProperties<CheckboxOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<CheckboxOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        width: 16,
        height: 16,
        flexShrink: 0,
        borderRadius: 4,
        backgroundColor: computed(() =>
          this.currentSignal.value
            ? lightTheme.component.checkbox.selected.background.selected.value
            : lightTheme.component.checkbox.selected.background.default.value,
        ),
        hover: {
          backgroundColor: computed(() =>
            this.currentSignal.value ? undefined : lightTheme.component.checkbox.selected.background.hover.value,
          ),
        },
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
        ...config?.defaultOverrides,
      },
    })
    super.add(
      new Check(undefined, undefined, {
        defaultOverrides: {
          display: computed(() => (this.currentSignal.value ? 'flex' : 'none')),
          color: lightTheme.component.checkbox.selected.icon.selected,
          flexShrink: 0,
          width: 12,
          height: 12,
        },
      }),
    )
  }

  add(): this {
    throw new Error(`the checkbox component can not have any children`)
  }
}
