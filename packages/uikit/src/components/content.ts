import { FlexNodeState, YogaProperties, createFlexNodeState } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped, createGlobalClippingPlanes, ClippingRect } from '../clipping.js'
import { ScrollbarProperties } from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties, setupInstancedPanel } from '../panel/instanced-panel.js'
import { TransformProperties, setupObjectTransform, computedTransformMatrix } from '../transform.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { createActivePropertyTransfomers } from '../active.js'
import { Signal, computed, signal, untracked } from '@preact/signals-core'
import {
  VisibilityProperties,
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  setupNode,
  keepAspectRatioPropertyTransformer,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
} from './utils.js'
import { abortableEffect, alignmentZMap } from '../utils.js'
import { Listeners, setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext, RootContext } from '../context.js'
import {
  PanelGroupProperties,
  RenderProperties,
  computedPanelGroupDependencies,
} from '../panel/instanced-panel-group.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { Box3, Material, Mesh, Object3D, Vector3 } from 'three'
import { darkPropertyTransformers } from '../dark.js'
import { getDefaultPanelMaterialConfig, makeClippedCast, PointerEventsProperties } from '../panel/index.js'
import { MergedProperties, computedInheritableProperty } from '../properties/index.js'
import { KeepAspectRatioProperties } from './image.js'
import { EventHandlers, ThreeEventMap } from '../events.js'

export type InheritableContentProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          PanelProperties &
          ZIndexProperties &
          TransformProperties &
          ScrollbarProperties &
          PanelGroupProperties &
          DepthAlignProperties &
          KeepAspectRatioProperties &
          VisibilityProperties &
          RenderProperties &
          PointerEventsProperties
      >
    >
  >
>

export type DepthAlignProperties = {
  depthAlign?: keyof typeof alignmentZMap
}

export type ContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InheritableContentProperties &
  Listeners &
  EventHandlers<EM>

export function createContentState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  style: Signal<ContentProperties<EM> | undefined>,
  properties: Signal<ContentProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  contentContainerRef: { current?: Object3D | null },
) {
  const flexState = createFlexNodeState()
  const hoveredList = signal<Array<number>>([])
  const pressedList = signal<Array<number>>([])

  const sizeSignal = signal(new Vector3(1, 1, 1))
  const aspectRatio = computed(() => sizeSignal.value.x / sizeSignal.value.y)

  //properties
  const mergedProperties = computedMergedProperties(
    style,
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(parentCtx.root.size),
      ...createHoverPropertyTransformers(hoveredList),
      ...createActivePropertyTransfomers(pressedList),
    },
    keepAspectRatioPropertyTransformer,
    (m) => m.add('aspectRatio', aspectRatio),
  )

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentCtx.root.pixelSize)

  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentCtx.clippingRect, globalMatrix, flexState.size, parentCtx.root.pixelSize)
  const isVisible = computedIsVisible(flexState, isClipped, mergedProperties)

  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const backgroundOrderInfo = computedOrderInfo(
    mergedProperties,
    'zIndexOffset',
    ElementType.Panel,
    groupDeps,
    parentCtx.orderInfo,
  )

  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Object, undefined, backgroundOrderInfo)

  const handlers = computedHandlers(style, properties, defaultProperties, hoveredList, pressedList)

  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  const measuredSize = new Vector3()
  const measuredCenter = new Vector3()

  return Object.assign(flexState, {
    measuredSize,
    measuredCenter,
    globalMatrix,
    isClipped,
    isVisible,
    mergedProperties,
    hoveredSignal: hoveredList,
    sizeSignal,
    orderInfo,
    backgroundOrderInfo,
    groupDeps,
    handlers,
    ancestorsHaveListeners,
    transformMatrix,
    root: parentCtx.root,
    interactionPanel: createInteractionPanel(
      backgroundOrderInfo,
      parentCtx.root,
      parentCtx.clippingRect,
      globalMatrix,
      flexState,
    ),
    remeasureContent: createMeasureContent(
      flexState,
      measuredSize,
      measuredCenter,
      mergedProperties,
      parentCtx.root,
      parentCtx.clippingRect,
      isVisible,
      orderInfo,
      sizeSignal,
      contentContainerRef,
    ),
  })
}

export function setupContent<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createContentState>,
  parentCtx: ParentContext,
  style: Signal<ContentProperties<EM> | undefined>,
  properties: Signal<ContentProperties<EM> | undefined>,
  object: Object3D,
  contentContainer: Object3D,
  abortSignal: AbortSignal,
) {
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  //create node
  setupNode(state, parentCtx, object, true, abortSignal)

  //transform
  setupObjectTransform(parentCtx.root, object, state.transformMatrix, abortSignal)

  //instanced panel
  setupInstancedPanel(
    state.mergedProperties,
    state.backgroundOrderInfo,
    state.groupDeps,
    parentCtx.root.panelGroupManager,
    state.globalMatrix,
    state.size,
    undefined,
    state.borderInset,
    parentCtx.clippingRect,
    state.isVisible,
    getDefaultPanelMaterialConfig(),
    abortSignal,
  )

  setupMatrixWorldUpdate(true, true, object, parentCtx.root, state.globalMatrix, false, abortSignal)

  setupPointerEvents(state.mergedProperties, state.ancestorsHaveListeners, parentCtx.root, object, true, abortSignal)

  setupLayoutListeners(style, properties, state.size, abortSignal)
  setupClippedListeners(style, properties, state.isClipped, abortSignal)

  setupInteractionPanel(state.interactionPanel, state.root, state.globalMatrix, state.size, abortSignal)

  setupContentContainer(
    state.remeasureContent,
    state.measuredSize,
    state.measuredCenter,
    state.mergedProperties,
    state.root,
    state,
    state.isVisible,
    contentContainer,
    abortSignal,
  )
}

const vectorHelper = new Vector3()

function setupContentContainer(
  measureContent: () => void,
  measuredSize: Vector3,
  measuredCenter: Vector3,
  propertiesSignal: Signal<MergedProperties>,
  root: RootContext,
  flexState: FlexNodeState,
  isVisible: Signal<boolean>,
  contentContainer: Object3D,
  abortSignal: AbortSignal,
) {
  measureContent()
  const depthAlign = computedInheritableProperty(propertiesSignal, 'depthAlign', defaultDepthAlign)
  const keepAspectRatio = computedInheritableProperty(propertiesSignal, 'keepAspectRatio', true)
  abortableEffect(() => {
    const properties = propertiesSignal.value
    updateRenderProperties(
      { current: contentContainer },
      isVisible.value,
      properties.read('renderOrder', 0),
      properties.read('depthTest', true),
      properties.read('depthWrite', false),
    )
    root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    const {
      size: { value: size },
      paddingInset: { value: paddingInset },
      borderInset: { value: borderInset },
    } = flexState
    if (size == null || paddingInset == null || borderInset == null) {
      return
    }
    const [width, height] = size
    const [pTop, pRight, pBottom, pLeft] = paddingInset
    const [bTop, bRight, bBottom, bLeft] = borderInset
    const topInset = pTop + bTop
    const rightInset = pRight + bRight
    const bottomInset = pBottom + bBottom
    const leftInset = pLeft + bLeft

    const innerWidth = width - leftInset - rightInset
    const innerHeight = height - topInset - bottomInset

    const pixelSize = root.pixelSize.value
    contentContainer.scale
      .set(
        innerWidth * pixelSize,
        innerHeight * pixelSize,
        keepAspectRatio.value ? (innerHeight * pixelSize * measuredSize.z) / measuredSize.y : measuredSize.z,
      )
      .divide(measuredSize)

    contentContainer.position.copy(measuredCenter).negate()

    contentContainer.position.z -= alignmentZMap[depthAlign.value] * measuredSize.z
    contentContainer.position.multiply(contentContainer.scale)
    contentContainer.position.add(
      vectorHelper.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0),
    )
    contentContainer.updateMatrix()
    root.requestRender()
  }, abortSignal)
}

const box3Helper = new Box3()
const smallValue = new Vector3().setScalar(0.001)

const defaultDepthAlign: keyof typeof alignmentZMap = 'back'

/**
 * normalizes the content so it has a height of 1
 */
function createMeasureContent(
  flexState: FlexNodeState,
  measuredSize: Vector3,
  measuredCenter: Vector3,
  propertiesSignal: Signal<MergedProperties>,
  root: RootContext,
  parentClippingRect: Signal<ClippingRect | undefined>,
  isVisible: Signal<boolean>,
  orderInfo: Signal<OrderInfo | undefined>,
  sizeSignal: Signal<Vector3>,
  contentContainerRef: { current?: Object3D | null },
) {
  const clippingPlanes = createGlobalClippingPlanes(root, parentClippingRect)

  const measureContent = () => {
    const contentContainer = contentContainerRef.current
    if (contentContainer == null) {
      return
    }
    contentContainer.traverse((object) => {
      if (object instanceof Mesh) {
        setupRenderOrder(object, root, orderInfo)
        object.material.clippingPlanes = clippingPlanes
        object.material.needsUpdate = true
        object.raycast = makeClippedCast(
          object,
          object.raycast,
          root.objectRef,
          parentClippingRect,
          orderInfo,
          flexState,
        )
      }
    })
    const parent = contentContainer.parent
    contentContainer.parent = null
    box3Helper.setFromObject(contentContainer)
    box3Helper.getSize(measuredSize).max(smallValue)
    sizeSignal.value = measuredSize

    if (parent != null) {
      contentContainer.parent = parent
    }
    box3Helper.getCenter(measuredCenter)
    root.requestRender()
  }
  return () => {
    const properties = propertiesSignal.peek()
    updateRenderProperties(
      contentContainerRef,
      isVisible.peek(),
      untracked(() => properties.read('renderOrder', 0)),
      untracked(() => properties.read('depthTest', true)),
      untracked(() => properties.read('depthWrite', false)),
    )
    measureContent()
  }
}

function updateRenderProperties(
  contentContainerRef: { current?: Object3D | null },
  visible: boolean,
  renderOrder: number,
  depthTest: boolean,
  depthWrite: boolean,
) {
  const contentContainer = contentContainerRef.current
  if (contentContainer == null) {
    return
  }
  contentContainer.visible = visible
  contentContainer.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return
    }
    object.renderOrder = renderOrder
    if (!(object.material instanceof Material)) {
      return
    }
    object.material.depthTest = depthTest
    object.material.depthWrite = depthWrite
    object.material.transparent = true
  })
}
