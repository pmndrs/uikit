import { BaseOutProperties, Container, InProperties, ThreeEventMap, RenderContext } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'

export type TooltipProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Tooltip<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, BaseOutProperties<EM>> {
  readonly open = signal(false)
  private timeoutId?: number

  constructor(
    inputProperties?: TooltipProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        onPointerOver: () => {
          if (this.timeoutId != null) {
            return
          }
          this.timeoutId = window.setTimeout(() => {
            this.timeoutId = undefined
            this.open.value = true
          }, 1000)
        },
        onPointerOut: () => {
          if (this.timeoutId != null) {
            clearTimeout(this.timeoutId)
            this.timeoutId = undefined
            return
          }
          this.open.value = false
        },
        positionType: 'relative',
        flexDirection: 'column',
        alignItems: 'center',
        ...config?.defaultOverrides,
      },
    })
  }
}

export type TooltipTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class TooltipTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: TooltipTriggerProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        alignSelf: 'stretch',
        ...config?.defaultOverrides,
      },
    })
  }
}

export type TooltipContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  TooltipContentOutProperties<EM>
>

export type TooltipContentOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  sideOffset?: number
}

export class TooltipContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  TooltipContentOutProperties<EM>
> {
  constructor(
    inputProperties?: TooltipContentProperties<EM>,
    initialClasses?: Array<InProperties<TooltipContentOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<TooltipContentOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        positionType: 'absolute',
        positionBottom: '100%',
        marginBottom: computed(() => this.properties.signal.sideOffset?.value ?? 4),
        zIndex: 50,
        overflow: 'hidden',
        borderRadius: borderRadius.md,
        borderWidth: 1,
        backgroundColor: colors.popover,
        paddingX: 12,
        paddingY: 6,
        wordBreak: 'keep-all',
        fontSize: 14,
        lineHeight: '20px',
        color: colors.popoverForeground,
        display: computed(() =>
          this.parentContainer.value instanceof Tooltip && this.parentContainer.value.open.value ? 'flex' : 'none',
        ),
        ...config?.defaultOverrides,
      },
    })
  }
}
