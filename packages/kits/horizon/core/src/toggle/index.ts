import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { computed, signal } from '@preact/signals-core'
import { theme } from '../theme.js'

export type ToggleOutProperties = BaseOutProperties & {
  checked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
  defaultChecked?: boolean
}

export class Toggle extends Container<ToggleOutProperties> {
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.checked ?? this.uncontrolledSignal.value ?? this.properties.value.defaultChecked,
  )
  public readonly handle: Container

  constructor(
    inputProperties?: InProperties<ToggleOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ToggleOutProperties>
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
        '*': {
          backgroundColor: theme.component.toggle.handle.default.value,
          hover: {
            backgroundColor: theme.component.toggle.handle.hovered.value,
          },
          active: {
            backgroundColor: theme.component.toggle.handle.pressed.value,
          },
          important: {
            backgroundColor: computed(() =>
              this.currentSignal.value ? theme.component.toggle.handle.selected.value : undefined,
            ),
          },
        },
        backgroundColor: theme.component.toggle.background.default.value,
        hover: {
          backgroundColor: theme.component.toggle.background.hovered.value,
        },
        active: {
          backgroundColor: theme.component.toggle.background.pressed.value,
        },
        important: {
          backgroundColor: computed(() =>
            this.currentSignal.value ? theme.component.toggle.background.selected.value : undefined,
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
      (this.handle = new Container(undefined, undefined, {
        defaultOverrides: {
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: 1000,
        },
      })),
    )
  }

  dispose(): void {
    this.handle.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the Toggle component can not have any children`)
  }
}
