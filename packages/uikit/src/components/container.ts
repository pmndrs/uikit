import { computed, signal, Signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { Matrix4, Vector2Tuple, Vector3, Vector2 } from 'three'
import { ClippingRect, computedClippingRect } from '../clipping.js'
import { ElementType, setupOrderInfo } from '../order.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { getDefaultPanelMaterialConfig } from '../panel/panel-material.js'
import {
  computedAnyAncestorScrollable,
  computedGlobalScrollMatrix,
  ScrollEventHandlers,
  setupScroll,
  setupScrollbars,
  setupScrollHandlers,
} from '../scroll.js'
import { computedFontFamilies, FontFamilies } from '../text/font.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { BaseOutProperties, InProperties } from '../properties/index.js'
import { defaults } from '../properties/defaults.js'
import { RenderContext } from '../context.js'
import { Parent } from './component.js'

export type ContainerProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Container<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  Properties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
  NonReactiveProperties = {},
> extends Parent<T, EM, Properties, NonReactiveProperties> {
  readonly downPointerMap = new Map<
    number,
    | { type: 'scroll-bar'; localPoint: Vector3; axisIndex: number }
    | { type: 'scroll-panel'; localPoint: Vector3; timestamp: number }
  >()
  readonly scrollVelocity = new Vector2()
  readonly anyAncestorScrollable: Signal<readonly [boolean, boolean]>
  readonly clippingRect: Signal<ClippingRect | undefined>
  readonly childrenMatrix: Signal<Matrix4 | undefined>
  readonly fontFamilies: Signal<FontFamilies | undefined>
  readonly scrollPosition = signal<Vector2Tuple>([0, 0])

  constructor(
    inputProperties?: InProperties<Properties, NonReactiveProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: RenderContext,
    overrideDefaults: Properties = defaults as Properties,
  ) {
    const scrollHandlers = signal<ScrollEventHandlers | undefined>(undefined)
    super(false, inputProperties, initialClasses, undefined, renderContext, overrideDefaults, scrollHandlers)
    this.material.visible = false

    setupScrollHandlers(scrollHandlers, this, this.abortSignal)

    this.childrenMatrix = computedGlobalScrollMatrix(this.properties, this.scrollPosition, this.globalMatrix)

    const parentClippingRect = computed(() => this.parentContainer.value?.clippingRect.value)

    this.fontFamilies = computedFontFamilies(this.properties, this.parentContainer)

    this.clippingRect = computedClippingRect(
      this.globalMatrix,
      this,
      this.properties.signal.pixelSize,
      parentClippingRect,
    )

    this.anyAncestorScrollable = computedAnyAncestorScrollable(this.parentContainer)

    const panelGroupDeps = computedPanelGroupDependencies(this.properties)
    setupOrderInfo(
      this.orderInfo,
      this.properties,
      'zIndexOffset',
      ElementType.Panel,
      panelGroupDeps,
      computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)),
      this.abortSignal,
    )

    setupInstancedPanel(
      this.properties,
      this.root,
      this.orderInfo,
      panelGroupDeps,
      this.globalPanelMatrix,
      this.size,
      this.borderInset,
      parentClippingRect,
      this.isVisible,
      getDefaultPanelMaterialConfig(),
      this.abortSignal,
    )

    //scrolling:
    setupScroll(this)
    setupScrollbars(this, parentClippingRect, this.orderInfo, panelGroupDeps)
  }
}
