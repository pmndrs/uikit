import {
  abortableEffect,
  BaseOutProperties,
  Component,
  Container,
  InProperties,
  RenderContext,
  Text,
  ThreeEventMap,
} from '@pmndrs/uikit'
import { computed, signal } from '@preact/signals-core'
import { lightTheme } from '../theme.js'
import { Vector3 } from 'three'

const vectorHelper = new Vector3()

export function percentageFormatting(value: number): string {
  return `${value.toFixed(0)}%`
}

export type SliderOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  value?: number
  onValueChange?: (value: number) => void
  valueFormat?: 'percentage' | ((value: number) => string)
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  /**
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg'
  leftLabel?: string
  rightLabel?: string
  icon: {
    new (
      inputProperties: any,
      initialClasses: any,
      config: { defaultOverrides?: InProperties<BaseOutProperties<EM>> },
    ): Component
  }
}

const sliderHeights: Record<Exclude<SliderOutProperties['size'], undefined>, number> = {
  sm: 12,
  md: 28,
  lg: 44,
}

const sliderThumbHeights: Record<Exclude<SliderOutProperties['size'], undefined>, number> = {
  sm: 8,
  md: 20,
  lg: 36,
}

const sliderProcessPaddingXs: Record<Exclude<SliderOutProperties['size'], undefined>, number> = {
  sm: 2,
  md: 4,
  lg: 4,
}

export class Slider<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  SliderOutProperties<EM>
> {
  public readonly uncontrolledSignal = signal<number | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue ?? 0,
  )
  private downPointerId?: number

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
        width: '100%',
        flexDirection: 'column',
        //TODO: why does it not work when putting the following listeners on the touch target?
        onPointerDown: (e) => {
          if (this.downPointerId != null) {
            return
          }
          this.downPointerId = e.pointerId
          this.handleSetValue(e)
          if (
            'target' in e &&
            e.target != null &&
            typeof e.target === 'object' &&
            'setPointerCapture' in e.target &&
            typeof e.target.setPointerCapture === 'function'
          ) {
            e.target.setPointerCapture(e.pointerId)
          }
        },
        onPointerMove: (e) => {
          if (this.downPointerId != e.pointerId) {
            return
          }
          this.handleSetValue(e)
        },
        onPointerUp: (e) => {
          if (this.downPointerId == null) {
            return
          }
          this.downPointerId = undefined
          e.stopPropagation?.()
        },
        ...config?.defaultOverrides,
      },
    })

    const format = computed(() => {
      let format = this.properties.value.valueFormat ?? 'percentage'
      if (format == 'percentage') {
        format = percentageFormatting
      }
      return format
    })

    const touchTarget = new Container(undefined, undefined, {
      defaultOverrides: {
        width: '100%',
        height: computed(() => (this.properties.value.size === 'lg' ? 48 : 64)),
        flexDirection: 'row',
        alignItems: 'center',
        '*': {
          hover: {
            backgroundColor: lightTheme.component.slider.handle.background.hover,
          },
          active: {
            backgroundColor: lightTheme.component.slider.handle.background.pressed,
          },
        },
      },
    })

    const sliderTrack = new Container(undefined, undefined, {
      defaultOverrides: {
        width: '100%',
        borderRadius: 1000,
        backgroundColor: lightTheme.component.slider.background,
        height: computed(() => sliderHeights[this.properties.value.size ?? 'md']),
      },
    })
    touchTarget.add(sliderTrack)

    const percentage = computed(() => {
      const min = this.properties.value.min ?? 0
      const max = this.properties.value.max ?? 100
      const range = max - min
      return `${(100 * (this.currentSignal.value - min)) / range}%` as const
    })

    const sliderProgress = new Container(undefined, undefined, {
      defaultOverrides: {
        borderRadius: 1000,
        flexShrink: 0,
        backgroundColor: lightTheme.component.slider.foreground.default,
        minWidth: computed(() =>
          Math.max(
            sliderHeights[this.properties.value.size ?? 'md'],
            2 * sliderProcessPaddingXs[this.properties.value.size ?? 'md'] + (sliderThumb.size.value?.[0] ?? 0),
          ),
        ),
        width: percentage,
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingX: computed(() => sliderProcessPaddingXs[this.properties.value.size ?? 'md']),
      },
    })
    sliderTrack.add(sliderProgress)

    const sliderThumb = new Container(undefined, undefined, {
      defaultOverrides: {
        flexShrink: 0,
        borderRadius: 1000,
        height: computed(() => sliderThumbHeights[this.properties.value.size ?? 'md']),
        minWidth: computed(() => sliderThumbHeights[this.properties.value.size ?? 'md']),
        paddingX: computed(() => (this.properties.value.size === 'lg' ? 16 : undefined)),
        flexDirection: 'row',
        alignItems: 'center',
        positionType: 'relative',
      },
    })
    sliderProgress.add(sliderThumb)

    const sliderThumbText = new Text(undefined, undefined, {
      defaultOverrides: {
        color: lightTheme.component.slider.handle.label,
        fontWeight: 700,
        lineHeight: '20px',
        backgroundColor: 'initial',
        display: computed(() =>
          this.properties.value.size == 'lg' && this.properties.value.icon == null ? 'flex' : 'none',
        ),
        fontSize: 14,
        text: computed(() => format.value(this.currentSignal.value)),
      },
    })
    sliderThumb.add(sliderThumbText)

    //setting up the icon
    abortableEffect(() => {
      const Icon = this.properties.value.icon
      if (Icon == null) {
        return
      }
      const icon = new Icon(undefined, undefined, {
        defaultOverrides: {
          color: lightTheme.component.slider.handle.icon,
          backgroundColor: 'initial',
          width: 24,
          height: 24,
          positionType: 'absolute',
          positionLeft: '50%',
          positionTop: '50%',
          transformTranslateX: '-50%',
          transformTranslateY: '-50%',
        },
      })
      sliderThumb.add(icon)
      return () => icon.dispose()
    }, this.abortSignal)

    const labels = new Container(undefined, undefined, {
      defaultOverrides: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 12,
        lineHeight: '16px',
        color: lightTheme.component.slider.label,
        fontWeight: 500,
      },
    })

    labels.add(
      new Text(undefined, undefined, {
        defaultOverrides: {
          text: computed(() => this.properties.signal.leftLabel.value ?? format.value(this.properties.value.min ?? 0)),
        },
      }),
      new Text(undefined, undefined, {
        defaultOverrides: {
          text: computed(
            () => this.properties.signal.rightLabel.value ?? format.value(this.properties.value.max ?? 100),
          ),
        },
      }),
    )

    super.add(touchTarget)
    super.add(labels)
  }

  private handleSetValue(e: { stopPropagation?: () => void; point: Vector3 }) {
    vectorHelper.copy(e.point)
    this.worldToLocal(vectorHelper)
    const minValue = this.properties.peek().min ?? 0
    const maxValue = this.properties.peek().max ?? 100
    const stepValue = this.properties.peek().step ?? 0.0001
    const newValue = Math.min(
      Math.max(
        Math.round(((vectorHelper.x + 0.5) * (maxValue - minValue) + minValue) / stepValue) * stepValue,
        minValue,
      ),
      maxValue,
    )
    if (this.properties.peek().value == null) {
      this.uncontrolledSignal.value = newValue
    }
    this.properties.peek().onValueChange?.(newValue)
    e.stopPropagation?.()
  }

  add(): this {
    throw new Error(`the Slider component can not have any children`)
  }
}
