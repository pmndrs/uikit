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
import { colors } from './theme.js'
import { Object3D } from 'three/src/Three.js'

export type SwitchOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  checked?: boolean
  disabled?: boolean
} & BaseOutProperties<EM>

export type SwitchNonReactiveProperties = {
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export type SwitchProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  SwitchOutProperties<EM>,
  SwitchNonReactiveProperties
>

export class Switch<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  SwitchOutProperties<EM>,
  SwitchNonReactiveProperties
> {
  constructor(
    inputProperties?: InProperties<SwitchOutProperties<EM>, SwitchNonReactiveProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext)
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

  protected internalResetProperties({
    defaultChecked,
    disabled = false,
    onCheckedChange,
    ...rest
  }: SwitchProperties<EM> = {}): void {
    const uncontrolled = getProperty(this, 'uncontrolled', () => computeDefaultChecked(defaultChecked))
    const checked = getProperty(this, 'checked', () => computeChecked(this.properties, uncontrolled))

    super.internalResetProperties({
      height: 24,
      width: 44,
      flexShrink: 0,
      flexDirection: 'row',
      padding: 2,
      alignItems: 'center',
      opacity: computed(() => (disabled ? 0.5 : undefined)),
      borderRadius: 1000,
      backgroundColor: computed(() => (checked.value ? colors.primary.value : colors.input.value)),
      cursor: computed(() => (disabled ? undefined : 'pointer')),
      onClick: computed(() =>
        disabled
          ? undefined
          : () => {
              if (this.properties.peek().checked == null) {
                uncontrolled.value = !checked.peek()
              }
              onCheckedChange?.(!checked.peek())
            },
      ),
      disabled,
      ...rest,
    })
  }

  add(...object: Object3D[]): this {
    throw new Error(`the switch component can not have any children`)
  }
}

function computeDefaultChecked(defaultChecked?: boolean) {
  return signal(defaultChecked ?? false)
}

function computeChecked(properties: Properties<SwitchOutProperties>, uncontrolled: Signal<boolean>) {
  return computed(() => properties.value.checked ?? uncontrolled.value)
}
