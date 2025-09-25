import { Container, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'
import type { Object3D } from 'three'

export type SwitchOutProperties = {
  checked?: boolean
  disabled?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
} & BaseOutProperties

export type SwitchProperties = InProperties<SwitchOutProperties>

export class Switch extends Container<SwitchOutProperties> {
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.checked ?? this.uncontrolledSignal.value ?? this.properties.value.defaultChecked,
  )
  public readonly handle: Container

  constructor(
    inputProperties?: InProperties<SwitchOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<SwitchOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        height: 24,
        width: 44,
        flexShrink: 0,
        flexDirection: 'row',
        padding: 2,
        alignItems: 'center',
        opacity: computed(() => (this.properties.value.disabled ? 0.5 : undefined)),
        borderRadius: 1000,
        backgroundColor: computed(() => (this.currentSignal.value ? colors.primary.value : colors.input.value)),
        cursor: computed(() => (this.properties.value.disabled ? undefined : 'pointer')),
        onClick: computed(() => {
          return this.properties.value.disabled
            ? undefined
            : () => {
                const checked = this.currentSignal.peek()
                if (this.properties.peek().checked == null) {
                  this.uncontrolledSignal.value = !checked
                }
                this.properties.peek().onCheckedChange?.(!checked)
              }
        }),
        disabled: computed(() => this.properties.value.disabled),
        ...config?.defaultOverrides,
      },
    })
    super.add(
      (this.handle = new Container(undefined, undefined, {
        defaults: componentDefaults,
        defaultOverrides: {
          '*': {
            borderColor: colors.border,
          },
          width: 20,
          height: 20,
          borderRadius: 1000,
          transformTranslateX: computed(() => (this.currentSignal.value ? 20 : 0)),
          backgroundColor: colors.background,
        },
      })),
    )
  }

  dispose(): void {
    this.handle.dispose()
    super.dispose()
  }

  add(...object: Object3D[]): this {
    throw new Error(`the switch component can not have any children`)
  }
}
