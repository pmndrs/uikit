import { computed, signal, Signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { Matrix4, Vector2Tuple, Vector3, Vector2 } from 'three'
import { ClippingRect, computedClippingRect } from '../clipping.js'
import { RenderContext } from '../components/root.js'
import { computedOrderInfo, ElementType, OrderInfo } from '../order.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { getDefaultPanelMaterialConfig } from '../panel/panel-material.js'
import { computedAnyAncestorScrollable, computedGlobalScrollMatrix, setupScroll, setupScrollbars } from '../scroll.js'
import { computedFontFamilies, FontFamilies } from '../text/font.js'
import { Component } from './component.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { AllProperties } from '../properties/index.js'

export type ContainerProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, {}>

export class Container<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T, EM, {}, {}> {
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

  private readonly groupDeps: ReturnType<typeof computedPanelGroupDependencies>

  constructor(
    imperativeProperties?: ContainerProperties,
    initialClasses?: Array<ContainerProperties>,
    renderContext?: RenderContext,
  ) {
    super(false, false, {}, imperativeProperties, initialClasses, undefined, renderContext)
    this.material.visible = false

    this.childrenMatrix = computedGlobalScrollMatrix(this.properties, this.scrollPosition, this.globalMatrix)

    this.groupDeps = computedPanelGroupDependencies(this.properties)

    const parentClippingRect = computed(() => this.parentContainer.value?.clippingRect.value)

    this.fontFamilies = computedFontFamilies(this.properties, this.parentContainer)

    this.clippingRect = computedClippingRect(
      this.globalMatrix,
      this,
      this.properties.getSignal('pixelSize'),
      parentClippingRect,
    )

    this.anyAncestorScrollable = computedAnyAncestorScrollable(this.parentContainer)

    setupInstancedPanel(
      this.properties,
      this.root,
      this.orderInfo,
      this.groupDeps,
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
    setupScrollbars(this, parentClippingRect, this.orderInfo, this.groupDeps)
  }

  protected computedOrderInfo(): Signal<OrderInfo | undefined> {
    return computedOrderInfo(
      this.properties,
      'zIndexOffset',
      ElementType.Panel,
      this.groupDeps,
      computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)),
    )
  }
}
