import { Container, RenderContext, ThreeEventMap, InProperties, BaseOutProperties, getProperty } from '@pmndrs/uikit'
import { Signal, signal, computed } from '@preact/signals-core'
import { colors } from './theme.js'
import { Vector3 } from 'three'

const vectorHelper = new Vector3()

export type SliderOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  disabled?: boolean
  value?: number
  min?: number
  max?: number
  step?: number
} & BaseOutProperties<EM>

export type SliderNonReactiveProperties = {
  defaultValue?: number
  onValueChange?: (value: number) => void
}

export type SliderProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  SliderOutProperties<EM>,
  SliderNonReactiveProperties
>

export class Slider<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  SliderOutProperties<EM>,
  SliderNonReactiveProperties
> {
  private downPointerId?: number

  constructor(
    inputProperties?: InProperties<SliderOutProperties<EM>, SliderNonReactiveProperties> | undefined,
    initialClasses?: (string | InProperties<BaseOutProperties<EM>>)[] | undefined,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext)

    const uncontrolled = getProperty(this, 'uncontrolled', () => computeDefaultValue())
    const value = getProperty(this, 'value', () => computeValue(this.properties, uncontrolled))
    const percentage = computed(() => {
      const min = this.properties.value.min ?? 0
      const max = this.properties.value.max ?? 100
      const range = max - min
      return `${(100 * (value.value - min)) / range}%` as const
    })

    // Create track
    const track = new Container({
      height: 8,
      positionType: 'absolute',
      positionLeft: 0,
      positionRight: 0,
      flexGrow: 1,
      borderRadius: 1000,
      backgroundColor: colors.secondary,
    })

    // Create fill
    const fill = new Container({
      height: '100%',
      width: percentage,
      borderRadius: 1000,
      backgroundColor: colors.primary,
    })

    track.add(fill)
    super.add(track)

    // Create thumb
    const thumb = new Container({
      zIndexOffset: 100,
      positionType: 'absolute',
      positionLeft: percentage,
      transformTranslateX: -10,
      transformTranslateY: -6,
      cursor: 'pointer',
      opacity: computed(() => ((this.properties.value.disabled ?? false) ? 0.5 : undefined)),
      height: 20,
      width: 20,
      borderWidth: 2,
      borderRadius: 1000,
      borderColor: colors.primary,
      backgroundColor: colors.background,
    })

    super.add(thumb)
  }

  protected internalResetProperties({
    defaultValue,
    onValueChange,
    disabled,
    value,
    min,
    max,
    step,
    ...rest
  }: SliderProperties<EM> = {}): void {
    const uncontrolled = getProperty(this, 'uncontrolled', () => computeDefaultValue(defaultValue))

    super.internalResetProperties({
      positionType: 'relative',
      flexDirection: 'column',
      height: 8,
      width: '100%',
      alignItems: 'center',
      onPointerDown: disabled
        ? undefined
        : (e: any) => {
            if (this.downPointerId != null) {
              return
            }
            this.downPointerId = e.pointerId
            this.handleSetValue(e, uncontrolled, onValueChange)
            ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          },
      onPointerMove: disabled
        ? undefined
        : (e: any) => {
            if (this.downPointerId != e.pointerId) {
              return
            }
            this.handleSetValue(e, uncontrolled, onValueChange)
          },
      onPointerUp: disabled
        ? undefined
        : (e: any) => {
            if (this.downPointerId == null) {
              return
            }
            this.downPointerId = undefined
            e.stopPropagation()
          },
      disabled,
      value,
      min,
      max,
      step,
      ...rest,
    })
  }

  private handleSetValue(e: any, uncontrolled: Signal<number>, onValueChange?: (value: number) => void) {
    vectorHelper.copy(e.point)
    this.worldToLocal(vectorHelper)
    const minValue = this.properties.peek().min ?? 0
    const maxValue = this.properties.peek().max ?? 100
    const stepValue = this.properties.peek().step ?? 1
    const newValue = Math.min(
      Math.max(
        Math.round(((vectorHelper.x + 0.5) * (maxValue - minValue) + minValue) / stepValue) * stepValue,
        minValue,
      ),
      maxValue,
    )
    if (this.properties.peek().value == null) {
      uncontrolled.value = newValue
    }
    onValueChange?.(newValue)
    e.stopPropagation()
  }

  add(): this {
    throw new Error(`the slider component can not have any children`)
  }
}

function computeDefaultValue(defaultValue?: number) {
  return signal(defaultValue ?? 50)
}

function computeValue(properties: any, uncontrolled: Signal<number>) {
  return computed(() => properties.value.value ?? uncontrolled.value)
}
