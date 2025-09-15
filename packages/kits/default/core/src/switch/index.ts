import { Container, ThreeEventMap, InProperties, BaseOutProperties, Properties, RenderContext } from '@pmndrs/uikit'
import { signal, computed, Signal } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'
import { Object3D } from 'three/src/Three.js'

export type SwitchOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  checked?: boolean
  disabled?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
} & BaseOutProperties<EM>

export type SwitchProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<SwitchOutProperties<EM>>

export class Switch<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  SwitchOutProperties<EM>
> {
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.checked ?? this.uncontrolledSignal.value ?? this.properties.value.defaultChecked,
  )
  public readonly handle!: Container

  constructor(
    inputProperties?: InProperties<SwitchOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<SwitchOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
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
          width: 20,
          height: 20,
          borderRadius: 1000,
          transformTranslateX: computed(() => (this.currentSignal.value ? 20 : 0)),
          backgroundColor: colors.background,
        },
      })),
    )
  }

  add(...object: Object3D[]): this {
    throw new Error(`the switch component can not have any children`)
  }
}
