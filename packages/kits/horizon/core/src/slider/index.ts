import {
  abortableEffect,
  BaseOutProperties,
  Component,
  Container,
  InProperties,
  RenderContext,
  Text,
} from '@pmndrs/uikit'
import { computed, signal } from '@preact/signals-core'
import { theme } from '../theme.js'
import { Vector3 } from 'three'

const vectorHelper = new Vector3()

export function percentageFormatting(value: number): string {
  return `${value.toFixed(0)}%`
}

export type SliderOutProperties = BaseOutProperties & {
  value?: number | string
  onValueChange?: (value: number) => void
  valueFormat?: 'percentage' | ((value: number) => string)
  defaultValue?: number | string
  min?: number | string
  max?: number | string
  step?: number | string
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
      config: { defaultOverrides?: InProperties<BaseOutProperties> },
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

export type SliderProperties = InProperties<SliderOutProperties>

export class Slider extends Container<SliderOutProperties> {
  public readonly uncontrolledSignal = signal<number | undefined>(undefined)
  public readonly currentSignal = computed(() =>
    Number(this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue ?? 0),
  )
  private downPointerId?: number

  public readonly touchTarget: Container
  public readonly track: Container
  public readonly progress: Container
  public readonly thumb: Container
  public readonly thumbText: Text
  public readonly labels: Container
  public readonly leftLabel: Text
  public readonly rightLabel: Text
  public icon?: Component

  constructor(
    inputProperties?: InProperties<SliderOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<SliderOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        width: '100%',
        flexDirection: 'column',
        ...config?.defaultOverrides,
      },
    })
    //TODO: why does it not work when putting the following listeners on the touch target?
    this.addEventListener('pointerdown', (e) => {
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
    })
    this.addEventListener('pointermove', (e) => {
      if (this.downPointerId != e.pointerId) {
        return
      }
      this.handleSetValue(e)
    })

    this.addEventListener('pointerup', (e) => {
      if (this.downPointerId == null) {
        return
      }
      this.downPointerId = undefined
      e.stopPropagation?.()
    })

    const format = computed(() => {
      let format = this.properties.value.valueFormat ?? 'percentage'
      if (format == 'percentage') {
        format = percentageFormatting
      }
      return format
    })

    this.touchTarget = new Container(undefined, undefined, {
      defaultOverrides: {
        width: '100%',
        height: computed(() => (this.properties.value.size === 'lg' ? 48 : 64)),
        flexDirection: 'row',
        alignItems: 'center',
        '*': {
          hover: {
            backgroundColor: theme.component.slider.handle.background.hover,
          },
          active: {
            backgroundColor: theme.component.slider.handle.background.pressed,
          },
        },
      },
    })

    this.track = new Container(undefined, undefined, {
      defaultOverrides: {
        width: '100%',
        borderRadius: 1000,
        backgroundColor: theme.component.slider.background,
        height: computed(() => sliderHeights[this.properties.value.size ?? 'md']),
      },
    })
    this.touchTarget.add(this.track)

    const percentage = computed(() => {
      const min = Number(this.properties.value.min ?? 0)
      const max = Number(this.properties.value.max ?? 100)
      const range = max - min
      return `${(100 * (this.currentSignal.value - min)) / range}%` as const
    })

    this.thumb = new Container(undefined, undefined, {
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

    this.progress = new Container(undefined, undefined, {
      defaultOverrides: {
        borderRadius: 1000,
        flexShrink: 0,
        backgroundColor: theme.component.slider.foreground.default,
        minWidth: computed(() =>
          Math.max(
            sliderHeights[this.properties.value.size ?? 'md'],
            2 * sliderProcessPaddingXs[this.properties.value.size ?? 'md'] + (this.thumb.size.value?.[0] ?? 0),
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
    this.progress.add(this.thumb)
    this.track.add(this.progress)
    ;(this as any).fill = this.progress

    this.thumbText = new Text(undefined, undefined, {
      defaultOverrides: {
        color: theme.component.slider.handle.label,
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
    this.thumb.add(this.thumbText)

    //setting up the icon
    abortableEffect(() => {
      const Icon = this.properties.value.icon
      if (Icon == null) {
        return
      }
      const icon = new Icon(undefined, undefined, {
        defaultOverrides: {
          color: theme.component.slider.handle.icon,
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
      this.thumb.add(icon)
      this.icon = icon
      return () => {
        icon.dispose()
        this.icon = icon
      }
    }, this.abortSignal)

    this.labels = new Container(undefined, undefined, {
      defaultOverrides: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 12,
        lineHeight: '16px',
        color: theme.component.slider.label,
        fontWeight: 500,
      },
    })

    this.labels.add(
      (this.leftLabel = new Text(undefined, undefined, {
        defaultOverrides: {
          text: computed(
            () => this.properties.signal.leftLabel.value ?? format.value(Number(this.properties.value.min ?? 0)),
          ),
        },
      })),
      (this.rightLabel = new Text(undefined, undefined, {
        defaultOverrides: {
          text: computed(
            () => this.properties.signal.rightLabel.value ?? format.value(Number(this.properties.value.max ?? 100)),
          ),
        },
      })),
    )

    super.add(this.touchTarget)
    super.add(this.labels)
  }

  private handleSetValue(e: { stopPropagation?: () => void; point: Vector3 }) {
    vectorHelper.copy(e.point)
    this.worldToLocal(vectorHelper)
    const minValue = Number(this.properties.peek().min ?? 0)
    const maxValue = Number(this.properties.peek().max ?? 100)
    const stepValue = Number(this.properties.peek().step ?? 0.0001)
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

  dispose(): void {
    this.leftLabel.dispose()
    this.rightLabel.dispose()
    this.thumbText.dispose()
    this.thumb.dispose()
    this.progress.dispose()
    this.track.dispose()
    this.touchTarget.dispose()
    this.icon?.dispose()
    this.labels.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the Slider component can not have any children`)
  }
}
