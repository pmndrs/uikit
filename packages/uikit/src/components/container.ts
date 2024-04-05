import { YogaProperties } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped, computedClippingRect } from '../clipping.js'
import {
  ScrollbarProperties,
  applyScrollPosition,
  computedGlobalScrollMatrix,
  createScrollPosition,
  createScrollbars,
  setupScrollHandler,
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
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedMergedProperties,
  createNode,
} from './utils.js'
import { Subscriptions } from '../utils.js'
import { Listeners, setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { Object3DRef, ParentContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { darkPropertyTransformers, getDefaultPanelMaterialConfig } from '../internals.js'

export type InheritableContainerProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          PanelProperties &
          ZIndexProperties &
          TransformProperties &
          ScrollbarProperties &
          PanelGroupProperties
      >
    >
  >
>

export type ContainerProperties = InheritableContainerProperties & Listeners

export function createContainer(
  parentContext: ParentContext,
  style: Signal<ContainerProperties | undefined>,
  properties: Signal<ContainerProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
) {
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const subscriptions = [] as Subscriptions

  setupCursorCleanup(hoveredSignal, subscriptions)

  //properties
  const mergedProperties = computedMergedProperties(style, properties, defaultProperties, {
    ...darkPropertyTransformers,
    ...createResponsivePropertyTransformers(parentContext.root.node.size),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  })

  //create node
  const node = createNode(parentContext, mergedProperties, object, subscriptions)

  //transform
  const transformMatrix = computedTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)

  //instanced panel
  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const orderInfo = computedOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentContext.orderInfo)
  createInstancedPanel(
    mergedProperties,
    orderInfo,
    groupDeps,
    parentContext.root.panelGroupManager,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    parentContext.clippingRect,
    isClipped,
    getDefaultPanelMaterialConfig(),
    subscriptions,
  )

  //scrolling:
  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentContext.root.pixelSize)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentContext.root.pixelSize)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    parentContext.clippingRect,
    orderInfo,
    parentContext.root.panelGroupManager,
    subscriptions,
  )
  const scrollHandlers = setupScrollHandler(
    node,
    scrollPosition,
    object,
    properties,
    parentContext.root.pixelSize,
    parentContext.root.onFrameSet,
    subscriptions,
  )

  setupLayoutListeners(style, properties, node.size, subscriptions)
  setupViewportListeners(style, properties, isClipped, subscriptions)

  return {
    clippingRect: computedClippingRect(
      globalMatrix,
      node.size,
      node.borderInset,
      node.overflow,
      parentContext.root.pixelSize,
      parentContext.clippingRect,
    ),
    childrenMatrix,
    node,
    orderInfo,
    root: parentContext.root,
    scrollPosition,
    interactionPanel: createInteractionPanel(
      node,
      orderInfo,
      parentContext.root,
      parentContext.clippingRect,
      subscriptions,
    ),
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers),
    subscriptions,
  }
}
