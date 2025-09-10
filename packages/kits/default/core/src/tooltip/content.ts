import { BaseOutProperties, Container, InProperties, ThreeEventMap, RenderContext } from '@pmndrs/uikit'
import { borderRadius, colors } from '../theme.js'
import { computed } from '@preact/signals-core'
import { Tooltip } from './index.js'

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


