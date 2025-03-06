import { YogaProperties, createFlexNodeState } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped, computedClippingRect } from '../clipping.js'
import {
  ScrollbarProperties,
  computedAnyAncestorScrollable,
  computedGlobalScrollMatrix,
  computedScrollHandlers,
  createScrollPosition,
  createScrollState,
  setupScroll,
  setupScrollbars,
} from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties, setupInstancedPanel } from '../panel/instanced-panel.js'
import { TransformProperties, setupObjectTransform, computedTransformMatrix } from '../transform.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { ElementType, ZIndexProperties, computedOrderInfo } from '../order.js'
import { createActivePropertyTransfomers } from '../active.js'
import { Signal, signal } from '@preact/signals-core'
import {
  VisibilityProperties,
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  setupNode,
  setupMatrixWorldUpdate,
} from './utils.js'
import { Listeners, setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { darkPropertyTransformers } from '../dark.js'
import { getDefaultPanelMaterialConfig, PointerEventsProperties } from '../panel/index.js'
import {
  computedAncestorsHaveListeners,
  computedInheritableProperty,
  computeDefaultProperties,
  setupPointerEvents,
  UpdateMatrixWorldProperties,
  EventHandlers,
  ThreeEventMap,
  Properties,
} from '../internals.js'
import { Object3D } from 'three'

export type InheritableContainerProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          PanelProperties &
          ZIndexProperties &
          TransformProperties &
          ScrollbarProperties &
          PanelGroupProperties &
          VisibilityProperties &
          UpdateMatrixWorldProperties &
          PointerEventsProperties
      >
    >
  >
>

export type ContainerProperties<EM extends ThreeEventMap = ThreeEventMap> = InheritableContainerProperties &
  Listeners &
  EventHandlers<EM>

export function createContainerState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  objectRef: { current?: Object3D | null },
  style: Signal<ContainerProperties<EM> | undefined>,
  properties: Signal<ContainerProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
) {
  const flexState = createFlexNodeState()
  const hoveredList = signal<Array<number>>([])
  const pressedList = signal<Array<number>>([])

  //properties
  const mergedProperties = computedMergedProperties(style, properties, defaultProperties, {
    ...darkPropertyTransformers,
    ...createResponsivePropertyTransformers(parentCtx.root.size),
    ...createHoverPropertyTransformers(hoveredList),
    ...createActivePropertyTransfomers(pressedList),
  })

  //transform
  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentCtx.root.pixelSize)

  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentCtx.clippingRect, globalMatrix, flexState.size, parentCtx.root.pixelSize)

  const isVisible = computedIsVisible(flexState, isClipped, mergedProperties)

  //instanced panel
  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const scrollPosition = createScrollPosition()
  const scrollbarWidth = computedInheritableProperty(mergedProperties, 'scrollbarWidth', 10)

  const orderInfo = computedOrderInfo(
    mergedProperties,
    'zIndexOffset',
    ElementType.Panel,
    groupDeps,
    parentCtx.orderInfo,
  )

  const componentState = Object.assign(flexState, {
    scrollState: createScrollState(),
    scrollbarWidth,
    mergedProperties,
    transformMatrix,
    hoveredList,
    defaultProperties: computeDefaultProperties(mergedProperties),
    globalMatrix,
    isClipped,
    isVisible,
    scrollPosition,
    groupDeps,
    orderInfo,
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx.anyAncestorScrollable),
    clippingRect: computedClippingRect(globalMatrix, flexState, parentCtx.root.pixelSize, parentCtx.clippingRect),
    childrenMatrix: computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentCtx.root.pixelSize),
    root: parentCtx.root,
  })

  const scrollHandlers = computedScrollHandlers(componentState, properties, objectRef)

  const handlers = computedHandlers(style, properties, defaultProperties, hoveredList, pressedList, scrollHandlers)
  return Object.assign(componentState, {
    interactionPanel: createInteractionPanel(
      orderInfo,
      parentCtx.root,
      parentCtx.clippingRect,
      globalMatrix,
      flexState,
    ),
    handlers,
    ancestorsHaveListeners: computedAncestorsHaveListeners(parentCtx, handlers),
  }) satisfies ParentContext
}

export function setupContainer<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createContainerState>,
  parentCtx: ParentContext,
  style: Signal<ContainerProperties<EM> | undefined>,
  properties: Signal<ContainerProperties<EM> | undefined>,
  object: Object3D,
  childrenContainer: Object3D,
  abortSignal: AbortSignal,
) {
  setupNode(state, parentCtx, object, false, abortSignal)

  setupObjectTransform(state.root, object, state.transformMatrix, abortSignal)
  setupCursorCleanup(state.hoveredList, abortSignal)

  setupInstancedPanel(
    state.mergedProperties,
    state.orderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    state.globalMatrix,
    state.size,
    undefined,
    state.borderInset,
    parentCtx.clippingRect,
    state.isVisible,
    getDefaultPanelMaterialConfig(),
    abortSignal,
  )

  //scrolling:
  setupScroll(state, properties, state.root.pixelSize, childrenContainer, abortSignal)
  setupScrollbars(
    state.mergedProperties,
    state.scrollPosition,
    state,
    state.globalMatrix,
    state.isVisible,
    parentCtx.clippingRect,
    state.orderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    state.scrollbarWidth,
    abortSignal,
  )

  setupInteractionPanel(state.interactionPanel, state.root, state.globalMatrix, state.size, abortSignal)
  setupPointerEvents(
    state.mergedProperties,
    state.ancestorsHaveListeners,
    state.root,
    state.interactionPanel,
    false,
    abortSignal,
  )

  const updateMatrixWorld = computedInheritableProperty(state.mergedProperties, 'updateMatrixWorld', false)
  setupMatrixWorldUpdate(updateMatrixWorld, false, object, state.root, state.globalMatrix, false, abortSignal)
  setupMatrixWorldUpdate(
    updateMatrixWorld,
    false,
    state.interactionPanel,
    state.root,
    state.globalMatrix,
    true,
    abortSignal,
  )

  setupLayoutListeners(style, properties, state.size, abortSignal)
  setupClippedListeners(style, properties, state.isClipped, abortSignal)
}
