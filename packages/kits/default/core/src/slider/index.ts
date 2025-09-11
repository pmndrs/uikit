import { Container, ThreeEventMap, InProperties, BaseOutProperties, RenderContext } from '@pmndrs/uikit'
import { Signal, signal, computed } from '@preact/signals-core'
import { colors } from '../theme.js'
import { Vector3 } from 'three'

const vectorHelper = new Vector3()

export type SliderOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  disabled?: boolean
  value?: number
  min?: number
  max?: number
  step?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
} & BaseOutProperties<EM>

export type SliderProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<SliderOutProperties<EM>>

export class Slider<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  SliderOutProperties<EM>
> {
  private downPointerId?: number

  public readonly uncontrolledSignal = signal<number | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue ?? 0,
  )

  constructor(
    inputProperties?: InProperties<SliderOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<SliderOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        positionType: 'relative',
        flexDirection: 'column',
        height: 8,
        width: '100%',
        alignItems: 'center',
        onPointerDown: computed(() => {
          const disabled = this.properties.value.disabled ?? false
          return disabled
            ? undefined
            : (e: any) => {
                if (this.downPointerId != null) {
                  return
                }
                this.downPointerId = e.pointerId
                this.handleSetValue(e, this.uncontrolledSignal, this.properties.peek().onValueChange)
                ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
              }
        }),
        onPointerMove: computed(() => {
          const disabled = this.properties.value.disabled ?? false
          return disabled
            ? undefined
            : (e: any) => {
                if (this.downPointerId != e.pointerId) {
                  return
                }
                this.handleSetValue(e, this.uncontrolledSignal, this.properties.peek().onValueChange)
              }
        }),
        onPointerUp: computed(() => {
          const disabled = this.properties.value.disabled ?? false
          return disabled
            ? undefined
            : (e: any) => {
                if (this.downPointerId == null) {
                  return
                }
                this.downPointerId = undefined
                e.stopPropagation()
              }
        }),
        ...config?.defaultOverrides,
      },
    })

    const percentage = computed(() => {
      const min = this.properties.value.min ?? 0
      const max = this.properties.value.max ?? 100
      const range = max - min
      return `${(100 * (this.currentSignal.value - min)) / range}%` as const
    })

    // Create track
    const track = new Container(undefined, undefined, {
      defaultOverrides: {
        height: 8,
        positionType: 'absolute',
        positionLeft: 0,
        positionRight: 0,
        flexGrow: 1,
        borderRadius: 1000,
        backgroundColor: colors.secondary,
      },
    })

    // Create fill
    const fill = new Container(undefined, undefined, {
      defaultOverrides: {
        height: '100%',
        width: percentage,
        borderRadius: 1000,
        backgroundColor: colors.primary,
      },
    })

    track.add(fill)
    super.add(track)

    // Create thumb
    const thumb = new Container(undefined, undefined, {
      defaultOverrides: {
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
      },
    })

    super.add(thumb)
  }

  private handleSetValue(e: any, uncontrolled: Signal<number | undefined>, onValueChange?: (value: number) => void) {
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
