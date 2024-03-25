import { YogaProperties } from '../flex/node.js'
import { addHoverHandlers, createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
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
import { Signal, computed, signal } from '@preact/signals-core'
import { WithConditionals, computeGlobalMatrix } from './utils.js'
import { Subscriptions, unsubscribeSubscriptions } from '../utils.js'
import { MergedProperties } from '../properties/merged.js'
import { Listeners, setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { Object3DRef, WithContext } from '../context.js'
import { ShadowProperties, computePanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { cloneHandlers, createInteractionPanel } from '../panel/instanced-panel-mesh.js'
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
  parentContext: WithContext,
  properties: ContainerProperties,
  defaultProperties: AllOptionalProperties | undefined,
  object: Object3DRef,
  childrenContainer: Object3DRef,
) {
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const subscriptions = [] as Subscriptions
  setupCursorCleanup(hoveredSignal, subscriptions)

  const propertyTransformers = {
    ...preferredColorSchemePropertyTransformers,
    ...createResponsivePropertyTransformers(parentContext.root.node.size),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  }

  const scrollHandlers = signal<EventHandlers>({})
  const propertiesSignal = signal(properties)
  const defaultPropertiesSignal = signal(defaultProperties)

  const mergedProperties = computed(() => {
    const merged = new MergedProperties(propertyTransformers)
    merged.addAll(defaultPropertiesSignal.value, propertiesSignal.value)
    return merged
  })

  const node = parentContext.node.createChild(mergedProperties, object, subscriptions)
  parentContext.node.addChild(node)

  const transformMatrix = computeTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computeGlobalMatrix(parentContext.matrix, transformMatrix)

  const isClipped = computeIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)
  const groupDeps = computePanelGroupDependencies(mergedProperties)

  const orderInfo = computeOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentContext.orderInfo)

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
    subscriptions,
  )

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentContext.root.pixelSize)
  const matrix = computeGlobalScrollMatrix(scrollPosition, globalMatrix, parentContext.root.pixelSize)
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

  const clippingRect = computeClippingRect(
    globalMatrix,
    node.size,
    node.borderInset,
    node.overflow,
    parentContext.root.pixelSize,
    parentContext.clippingRect,
  )

  setupLayoutListeners(propertiesSignal, node.size, subscriptions)
  setupViewportListeners(propertiesSignal, isClipped, subscriptions)

  const onScrollFrame = setupScrollHandler(
    node,
    scrollPosition,
    object,
    propertiesSignal,
    parentContext.root.pixelSize,
    scrollHandlers,
    subscriptions,
  )
  parentContext.root.onFrameSet.add(onScrollFrame)

  subscriptions.push(() => {
    parentContext.root.onFrameSet.delete(onScrollFrame)
    parentContext.node.removeChild(node)
    node.destroy()
  })

  return {
    scrollHandlers,
    isClipped,
    clippingRect,
    matrix,
    node,
    object,
    orderInfo,
    root: parentContext.root,
    propertiesSignal,
    defaultPropertiesSignal,
    interactionPanel: createInteractionPanel(
      node,
      orderInfo,
      parentContext.root,
      parentContext.clippingRect,
      subscriptions,
    ),
    handlers: computed(() => {
      const properties = propertiesSignal.value
      const defaultProperties = defaultPropertiesSignal.value
      const handlers = cloneHandlers(properties)
      addHoverHandlers(handlers, properties, defaultProperties, hoveredSignal)
      addActiveHandlers(handlers, properties, defaultProperties, activeSignal)
      return handlers
    }),
    subscriptions,
  }
}

export function destroyContainer(container: ReturnType<typeof createContainer>) {
  unsubscribeSubscriptions(container.subscriptions)
}
