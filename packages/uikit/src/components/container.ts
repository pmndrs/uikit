import { FlexNode, YogaProperties, createFlexNodeState } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped, computedClippingRect } from '../clipping.js'
import {
  ScrollbarProperties,
  applyScrollPosition,
  computedAnyAncestorScrollable,
  computedGlobalScrollMatrix,
  computedScrollHandlers,
  createScrollPosition,
  createScrollbars,
} from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties, createInstancedPanel } from '../panel/instanced-panel.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
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
  createNode,
  setupMatrixWorldUpdate,
} from './utils.js'
import { Listeners, setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { Object3DRef, ParentContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { Initializers } from '../utils.js'
import { darkPropertyTransformers } from '../dark.js'
import { getDefaultPanelMaterialConfig } from '../panel/index.js'
import {
  computedInheritableProperty,
  computePointerEventsProperties,
  setupInteractableDecendant,
  setupPointerEvents,
  UpdateMatrixWorldProperties,
} from '../internals.js'

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
          UpdateMatrixWorldProperties
      >
    >
  >
>

export type ContainerProperties = InheritableContainerProperties & Listeners

export function createContainer(
  parentCtx: ParentContext,
  style: Signal<ContainerProperties | undefined>,
  properties: Signal<ContainerProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
) {
  const node = signal<FlexNode | undefined>(undefined)
  const flexState = createFlexNodeState()
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const initializers: Initializers = []

  setupCursorCleanup(hoveredSignal, initializers)

  //properties
  const mergedProperties = computedMergedProperties(style, properties, defaultProperties, {
    ...darkPropertyTransformers,
    ...createResponsivePropertyTransformers(parentCtx.root.size),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  })

  //create node
  createNode(node, flexState, parentCtx, mergedProperties, object, false, initializers)

  //transform
  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentCtx.root.pixelSize)
  applyTransform(parentCtx.root, object, transformMatrix, initializers)

  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentCtx.clippingRect, globalMatrix, flexState.size, parentCtx.root.pixelSize)

  const isVisible = computedIsVisible(flexState, isClipped, mergedProperties)

  //instanced panel
  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const orderInfo = computedOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentCtx.orderInfo)
  initializers.push((subscriptions) =>
    createInstancedPanel(
      mergedProperties,
      orderInfo,
      groupDeps,
      parentCtx.root.panelGroupManager,
      globalMatrix,
      flexState.size,
      undefined,
      flexState.borderInset,
      parentCtx.clippingRect,
      isVisible,
      getDefaultPanelMaterialConfig(),
      subscriptions,
    ),
  )

  //scrolling:
  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentCtx.root.pixelSize, initializers)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentCtx.root.pixelSize)
  const scrollbarWidth = computedInheritableProperty(mergedProperties, 'scrollbarWidth', 10)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    flexState,
    globalMatrix,
    isVisible,
    parentCtx.clippingRect,
    orderInfo,
    parentCtx.root.panelGroupManager,
    scrollbarWidth,
    initializers,
  )
  const interactionPanel = createInteractionPanel(
    orderInfo,
    parentCtx.root,
    parentCtx.clippingRect,
    flexState.size,
    globalMatrix,
    initializers,
  )
  const pointerEventsProperties = computePointerEventsProperties(mergedProperties)
  setupPointerEvents(pointerEventsProperties, interactionPanel, initializers)
  setupInteractableDecendant(pointerEventsProperties.pointerEvents, parentCtx.root, interactionPanel, initializers)
  const scrollHandlers = computedScrollHandlers(
    scrollPosition,
    parentCtx.anyAncestorScrollable,
    flexState,
    object,
    scrollbarWidth,
    properties,
    parentCtx.root,
    initializers,
  )

  const updateMatrixWorld = computedInheritableProperty(mergedProperties, 'updateMatrixWorld', false)
  setupMatrixWorldUpdate(updateMatrixWorld, false, object, parentCtx.root, globalMatrix, initializers, false)
  setupMatrixWorldUpdate(updateMatrixWorld, false, interactionPanel, parentCtx.root, globalMatrix, initializers, true)

  setupLayoutListeners(style, properties, flexState.size, initializers)
  setupClippedListeners(style, properties, isClipped, initializers)

  return Object.assign(flexState, {
    pointerEventsProperties,
    globalMatrix,
    isClipped,
    isVisible,
    mergedProperties,
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx.anyAncestorScrollable),
    clippingRect: computedClippingRect(globalMatrix, flexState, parentCtx.root.pixelSize, parentCtx.clippingRect),
    childrenMatrix,
    node,
    orderInfo,
    root: parentCtx.root,
    scrollPosition,
    interactionPanel,
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers),
    initializers,
  })
}
