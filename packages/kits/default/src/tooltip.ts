import { Container, ThreeEventMap } from '@pmndrs/uikit'
import { InProperties, BaseOutProperties } from '@pmndrs/uikit/src/properties/index.js'
import { signal, computed } from '@preact/signals-core'
import { borderRadius, colors } from './theme.js'

export type TooltipProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Tooltip<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, BaseOutProperties<EM>> {
  readonly open = signal(false)
  private timeoutId?: number

  protected internalResetProperties(inputProperties?: TooltipProperties<EM>): void {
    super.internalResetProperties({
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
      ...inputProperties,
    })
  }
}

export type TooltipTriggerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class TooltipTrigger<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: TooltipTriggerProperties<EM>): void {
    super.internalResetProperties({
      alignSelf: 'stretch',
      ...inputProperties,
    })
  }
}

export type TooltipContentNonReactiveProperties = {
  sideOffset?: number
}

export type TooltipContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  BaseOutProperties<EM>,
  TooltipContentNonReactiveProperties
>

export class TooltipContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>,
  TooltipContentNonReactiveProperties
> {
  protected internalResetProperties({ sideOffset = 4, ...rest }: TooltipContentProperties<EM> = {}): void {
    super.internalResetProperties({
      positionType: 'absolute',
      positionBottom: '100%',
      marginBottom: sideOffset,
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
      ...rest,
    })
  }
}
