import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { computed, signal } from '@preact/signals-core'
import { lightTheme } from '../theme.js'

export type ToggleOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  checked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  defaultChecked?: boolean
}

export class Toggle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ToggleOutProperties<EM>
> {
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.checked ?? this.uncontrolledSignal.value ?? this.properties.value.defaultChecked,
  )

  constructor(
    inputProperties?: InProperties<ToggleOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ToggleOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        cursor: 'pointer',
        flexShrink: 0,
        borderRadius: 1000,
        padding: 2,
        height: 24,
        width: 40,
        justifyContent: computed(() => (this.currentSignal.value ? 'flex-end' : 'flex-start')),
        backgroundColor: computed(() =>
          this.currentSignal.value
            ? lightTheme.component.toggle.background.selected.value
            : lightTheme.component.toggle.background.default.value,
        ),
        '*': {
          backgroundColor: computed(() =>
            this.currentSignal.value
              ? lightTheme.component.toggle.handle.selected.value
              : lightTheme.component.toggle.handle.default.value,
          ),
          hover: {
            backgroundColor: computed(() =>
              this.currentSignal.value ? undefined : lightTheme.component.toggle.handle.hovered.value,
            ),
          },
        },
        hover: {
          backgroundColor: computed(() =>
            this.currentSignal.value ? undefined : lightTheme.component.toggle.background.hovered.value,
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
      new Container(undefined, undefined, {
        defaultOverrides: {
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: 1000,
        },
      }),
    )
  }

  add(): this {
    throw new Error(`the Toggle component can not have any children`)
  }
}
