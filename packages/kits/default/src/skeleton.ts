import { abortableEffect, BaseOutProperties, Container, InProperties, ThreeEventMap } from '@pmndrs/uikit'
import { signal } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'

export type SkeletonProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Skeleton<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  private readonly opacity = signal(1)
  private time = 0

  constructor(
    inputProperties?: SkeletonProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: any,
  ) {
    super(inputProperties, initialClasses, renderContext)
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

  protected internalResetProperties(inputProperties?: SkeletonProperties<EM>): void {
    super.internalResetProperties({
      borderRadius: borderRadius.md,
      backgroundColor: colors.muted,
      opacity: this.opacity,
      ...inputProperties,
    })
  }
}
