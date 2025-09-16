import {
  abortableEffect,
  BaseOutProperties,
  Container,
  InProperties,
  ThreeEventMap,
  RenderContext,
} from '@pmndrs/uikit'
import { Signal, signal } from '@preact/signals-core'
import { borderRadius, colors, componentDefaults } from '../theme.js'

export type SkeletonProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Skeleton<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  private readonly opacity: Signal<number>
  private time = 0

  constructor(
    inputProperties?: SkeletonProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    const opacity = signal(1)
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        borderRadius: borderRadius.md,
        backgroundColor: colors.muted,
        opacity,
        ...config?.defaultOverrides,
      },
    })
    this.opacity = opacity
    abortableEffect(() => {
      const fn = this.animate.bind(this)
      const root = this.root.value
      root.onFrameSet.add(fn)
      return () => root.onFrameSet.delete(fn)
    }, this.abortSignal)
  }

  private animate(delta: number) {
    this.opacity.value = Math.cos((this.time / 1000) * Math.PI) * 0.25 + 0.75
    this.time += delta
    this.root.peek().requestFrame?.()
  }
}
