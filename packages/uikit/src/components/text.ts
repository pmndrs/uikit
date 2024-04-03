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
import { addActiveHandlers, createActivePropertyTransfomers } from '../active.js'
import { Signal, computed, signal } from '@preact/signals-core'
import { WithConditionals, computedGlobalMatrix } from './utils.js'
import { Subscriptions, readReactive, unsubscribeSubscriptions } from '../utils.js'
import { MergedProperties } from '../properties/merged.js'
import { Listeners, setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { Object3DRef, WithContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { addHandlers, cloneHandlers, createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { EventHandlers } from '../events.js'
import {
  FontFamilies,
  InstancedTextProperties,
  computedFont,
  computedGylphGroupDependencies,
  createInstancedText,
  darkPropertyTransformers,
  getDefaultPanelMaterialConfig,
} from '../internals.js'

export type InheritableTextProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          PanelProperties &
          ZIndexProperties &
          TransformProperties &
          ScrollbarProperties &
          PanelGroupProperties &
          InstancedTextProperties
      >
    >
  >
>

export type TextProperties = InheritableTextProperties & Listeners & EventHandlers

export function createText(
  parentContext: WithContext,
  textSignal: Signal<string | Signal<string> | Array<string | Signal<string>>>,
  fontFamilies: Signal<FontFamilies | undefined> | undefined,
  properties: Signal<TextProperties>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
) {
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const subscriptions = [] as Subscriptions
  setupCursorCleanup(hoveredSignal, subscriptions)

  const postTranslators = {
    ...darkPropertyTransformers,
    ...createResponsivePropertyTransformers(parentContext.root.node.size),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  }

  const mergedProperties = computed(() => {
    const merged = new MergedProperties()
    merged.addAll(defaultProperties.value, properties.value, postTranslators)
    return merged
  })

  const node = parentContext.node.createChild(mergedProperties, object, subscriptions)
  parentContext.node.addChild(node)
  subscriptions.push(() => {
    parentContext.node.removeChild(node)
    node.destroy()
  })

  const transformMatrix = computedTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computedGlobalMatrix(parentContext.matrix, transformMatrix)

  const isClipped = computedIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)
  const groupDeps = computedPanelGroupDependencies(mergedProperties)

  const backgroundOrderInfo = computedOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentContext.orderInfo)

  createInstancedPanel(
    mergedProperties,
    backgroundOrderInfo,
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

  const fontSignal = computedFont(mergedProperties, fontFamilies, parentContext.root.renderer, subscriptions)
  const orderInfo = computedOrderInfo(
    undefined,
    ElementType.Text,
    computedGylphGroupDependencies(fontSignal),
    parentContext.orderInfo,
  )

  const measureFunc = createInstancedText(
    mergedProperties,
    textSignal,
    globalMatrix,
    node,
    isClipped,
    parentContext.clippingRect,
    orderInfo,
    fontSignal,
    parentContext.root.gylphGroupManager,
    undefined,
    undefined,
    undefined,
    subscriptions,
  )
  subscriptions.push(node.setMeasureFunc(measureFunc))

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
    backgroundOrderInfo,
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

  setupLayoutListeners(properties, node.size, subscriptions)
  setupViewportListeners(properties, isClipped, subscriptions)

  const scrollHandlers = setupScrollHandler(
    node,
    scrollPosition,
    object,
    properties,
    parentContext.root.pixelSize,
    parentContext.root.onFrameSet,
    subscriptions,
  )

  return {
    isClipped,
    clippingRect,
    matrix,
    node,
    object,
    orderInfo: backgroundOrderInfo,
    root: parentContext.root,
    scrollPosition,
    interactionPanel: createInteractionPanel(
      node,
      backgroundOrderInfo,
      parentContext.root,
      parentContext.clippingRect,
      subscriptions,
    ),
    handlers: computed(() => {
      const handlers = cloneHandlers(properties.value)
      addHandlers(handlers, scrollHandlers.value)
      addHoverHandlers(handlers, properties.value, defaultProperties.value, hoveredSignal)
      addActiveHandlers(handlers, properties.value, defaultProperties.value, activeSignal)
      return handlers
    }),
    subscriptions,
  }
}

export function destroyText(text: ReturnType<typeof createText>) {
  unsubscribeSubscriptions(text.subscriptions)
}
