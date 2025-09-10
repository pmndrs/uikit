import {
  Container,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  Properties,
  getProperty,
  RenderContext,
} from '@pmndrs/uikit'
import { signal, computed, Signal } from '@preact/signals-core'
import { colors } from '../theme.js'
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
  constructor(
    inputProperties?: InProperties<SwitchOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<SwitchOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        height: 24,
        width: 44,
        flexShrink: 0,
        flexDirection: 'row',
        padding: 2,
        alignItems: 'center',
        opacity: computed(() => (this.properties.signal.disabled?.value ? 0.5 : undefined)),
        borderRadius: 1000,
        backgroundColor: computed(() => (this.getChecked().value ? colors.primary.value : colors.input.value)),
        cursor: computed(() => (this.properties.signal.disabled?.value ? undefined : 'pointer')),
        onClick: computed(() => {
          return this.properties.signal.disabled?.value
            ? undefined
            : () => {
                const checked = this.getChecked().peek()
                if (this.properties.peek().checked == null) {
                  this.getUncontrolled().value = !checked
                }
                this.properties.peek().onCheckedChange?.(!checked)
              }
        }),
        disabled: computed(() => this.properties.signal.disabled?.value),
        ...config?.defaultOverrides,
      },
    })
    const uncontrolled = getProperty(this, 'uncontrolled', () => computeDefaultChecked())
    const checked = getProperty(this, 'checked', () => computeChecked(this.properties, uncontrolled))
    super.add(
      new Container({
        width: 20,
        height: 20,
        borderRadius: 1000,
        transformTranslateX: computed(() => (checked.value ? 20 : 0)),
        backgroundColor: colors.background,
      }),
    )
  }

  add(...object: Object3D[]): this {
    throw new Error(`the switch component can not have any children`)
  }

  private getUncontrolled() {
    return getProperty(this, 'uncontrolled', () => signal(this.properties.signal.defaultChecked?.value ?? false))
  }
  private getChecked() {
    return getProperty(this, 'checked', () => computeChecked(this.properties, this.getUncontrolled()))
  }
}

function computeDefaultChecked(defaultChecked?: boolean) {
  return signal(defaultChecked ?? false)
}

function computeChecked(properties: Properties<SwitchOutProperties>, uncontrolled: Signal<boolean>) {
  return computed(() => properties.value.checked ?? uncontrolled.value)
}
