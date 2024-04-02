import { YogaProperties } from '../flex/node.js'
import { addHoverHandlers, createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
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
import { preferredColorSchemePropertyTransformers } from '../dark.js'
import { addActiveHandlers, createActivePropertyTransfomers } from '../active.js'
import { computed, signal } from '@preact/signals-core'
import { WithConditionals, computedGlobalMatrix } from './utils.js'
import { Subscriptions, unsubscribeSubscriptions } from '../utils.js'
import { MergedProperties } from '../properties/merged.js'
import { Listeners, setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { Object3DRef, WithContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { cloneHandlers, createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { EventHandlers } from '../events.js'
import { getDefaultPanelMaterialConfig } from '../internals.js'

export type InheritableContainerProperties = WithConditionals<
  WithClasses<
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

  const transformMatrix = computedTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computedGlobalMatrix(parentContext.matrix, transformMatrix)

  const isClipped = computedIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)
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

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentContext.root.pixelSize)
  const matrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentContext.root.pixelSize)
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

  const clippingRect = computedClippingRect(
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
