import { YogaProperties } from '../flex/node.js'
import { addHoverHandlers, createHoverPropertyTransformers } from '../hover.js'
import { computeIsClipped, computeClippingRect } from '../clipping.js'
import {
  ScrollbarProperties,
  applyScrollPosition,
  computeGlobalScrollMatrix,
  createScrollPosition,
  createScrollbars,
  setupScrollHandler,
} from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties, createInstancedPanel } from '../panel/instanced-panel.js'
import { TransformProperties, applyTransform, computeTransformMatrix } from '../transform.js'
import { AllOptionalProperties, Properties, WithClasses, WithReactive } from '../properties/default.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { ElementType, ZIndexOffset, computeOrderInfo } from '../order.js'
import { preferredColorSchemePropertyTransformers } from '../dark.js'
import { addActiveHandlers, createActivePropertyTransfomers } from '../active.js'
import { Signal } from '@preact/signals-core'
import { WithConditionals, computeGlobalMatrix } from './utils.js'
import { Subscriptions, unsubscribeSubscriptions } from '../utils.js'
import { MergedProperties, PropertyTransformers } from '../properties/merged.js'
import { Listeners, setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { Object3DRef, WithContext } from '../context.js'
import { ShadowProperties, computePanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { cloneHandlers } from '../panel/instanced-panel-mesh.js'
import { MaterialClass } from '../panel/panel-material.js'
import { Vector2Tuple } from 'three'
import { EventHandlers } from '../events.js'

export type InheritableContainerProperties = WithConditionals<
  WithClasses<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          PanelProperties &
          TransformProperties & {
            zIndexOffset?: ZIndexOffset
            panelMaterialClass?: MaterialClass
          } & ScrollbarProperties &
          ShadowProperties
      >
    >
  >
>

export type ContainerProperties = InheritableContainerProperties & Listeners & EventHandlers

export function createContainer(
  propertiesSignal: Signal<MergedProperties>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
  parent: WithContext,
  scrollHandlers: Signal<EventHandlers | undefined>,
  listeners: Listeners,
  subscriptions: Subscriptions,
): WithContext {
  const node = parent.node.createChild(propertiesSignal, object, subscriptions)
  parent.node.addChild(node)

  const transformMatrix = computeTransformMatrix(propertiesSignal, node, parent.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computeGlobalMatrix(parent.matrix, transformMatrix)

  const isClipped = computeIsClipped(parent.clippingRect, globalMatrix, node.size, parent.root.pixelSize)
  const groupDeps = computePanelGroupDependencies(propertiesSignal)

  const orderInfo = computeOrderInfo(propertiesSignal, ElementType.Panel, groupDeps, parent.orderInfo)

  createInstancedPanel(
    propertiesSignal,
    orderInfo,
    groupDeps,
    parent.root.panelGroupManager,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    parent.clippingRect,
    isClipped,
    subscriptions,
  )

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parent.root.pixelSize)
  const matrix = computeGlobalScrollMatrix(scrollPosition, globalMatrix, parent.root.pixelSize)
  createScrollbars(
    propertiesSignal,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    parent.clippingRect,
    orderInfo,
    parent.root.panelGroupManager,
    subscriptions,
  )

  const clippingRect = computeClippingRect(
    globalMatrix,
    node.size,
    node.borderInset,
    node.overflow,
    parent.root.pixelSize,
    parent.clippingRect,
  )

  setupLayoutListeners(listeners, node.size, subscriptions)
  setupViewportListeners(listeners, isClipped, subscriptions)

  const onScrollFrame = setupScrollHandler(
    node,
    scrollPosition,
    object,
    listeners,
    parent.root.pixelSize,
    scrollHandlers,
    subscriptions,
  )
  parent.root.onFrameSet.add(onScrollFrame)

  subscriptions.push(() => {
    parent.root.onFrameSet.delete(onScrollFrame)
    parent.node.removeChild(node)
    node.destroy()
  })

  return {
    isClipped,
    clippingRect,
    matrix,
    node,
    object,
    orderInfo,
    root: parent.root,
  }
}

export function createContainerPropertyTransfomers(
  rootSize: Signal<Vector2Tuple>,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
): PropertyTransformers {
  return {
    ...preferredColorSchemePropertyTransformers,
    ...createResponsivePropertyTransformers(rootSize),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  }
}

export function updateContainerProperties(
  propertiesSignal: Signal<MergedProperties>,
  properties: Properties,
  defaultProperties: AllOptionalProperties | undefined,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  transformers: PropertyTransformers,
  propertiesSubscriptions: Subscriptions,
) {
  //build merged properties
  const merged = new MergedProperties(transformers)
  merged.addAll(defaultProperties, properties)
  propertiesSignal.value = merged

  //build handlers
  const handlers = cloneHandlers(properties)
  unsubscribeSubscriptions(propertiesSubscriptions)
  addHoverHandlers(handlers, properties, defaultProperties, hoveredSignal, propertiesSubscriptions)
  addActiveHandlers(handlers, properties, defaultProperties, activeSignal)
  return handlers
}
