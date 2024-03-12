import { WithReactive } from '../properties/utils.js'
import {
  PanelGroupDependencies,
  computePanelGroupDependencies,
  createInstancePanel,
  createInteractionPanel,
} from '../panel/react.js'
import { YogaProperties } from '../flex/node.js'
import { applyHoverProperties } from '../hover.js'
import { computeIsClipped, computeClippingRect } from '../clipping.js'
import { ScrollbarProperties, computeGlobalScrollMatrix, createScrollPosition, createScrollbars } from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { InstancedPanel, PanelProperties } from '../panel/instanced-panel.js'
import { TransformProperties, computeTransformMatrix } from '../transform.js'
import { Properties, WithClasses } from '../properties/default.js'
import { applyResponsiveProperties } from '../responsive.js'
import { ElementType, computeOrderInfo } from '../order.js'
import { applyPreferredColorSchemeProperties } from '../dark.js'
import { applyActiveProperties } from '../active.js'
import { Signal, signal } from '@preact/signals-core'
import { computeGlobalMatrix } from './utils.js'
import { WithConditionals } from '../react/utils.js'
import { Subscriptions } from '../utils.js'
import { MergedProperties } from '../properties/merged.js'
import { LayoutListeners, ViewportListeners, setupLayoutListeners, setupViewportListeners } from '../listeners.js'

export type ContainerProperties = WithConditionals<
  WithClasses<
    WithAllAliases<WithReactive<YogaProperties & PanelProperties & TransformProperties> & ScrollbarProperties>
  >
>

export class Container {
  //undefined as any is okay here since the value of the signal will be overwritten before its use
  private propertiesSignal: Signal<MergedProperties> = signal(undefined as any)
  private subscriptions: Subscriptions = []

  private listeners: LayoutListeners & ViewportListeners = {}

  constructor(properties: Properties, defaultProperties?: Properties) {
    this.setProperties(properties, defaultProperties)

    //setup the container
    const node = parentNode.createChild(this.propertiesSignal, groupRef, subscriptions)
    parentNode.addChild(node)

    const transformMatrix = computeTransformMatrix(this.propertiesSignal, node)
    const globalMatrix = computeGlobalMatrix(parentMatrix, transformMatrix)
    const isClipped = computeIsClipped(parentClippingRect, globalMatrix, node.size, node)
    const groupDeps = computePanelGroupDependencies(this.propertiesSignal)

    const orderInfo = computeOrderInfo(this.propertiesSignal, ElementType.Panel, groupDeps, parentOrderInfo)

    createInstancePanel(
      this.propertiesSignal,
      orderInfo,
      groupDeps,
      getInstancedPanelGroup,
      globalMatrix,
      node.size,
      undefined,
      node.borderInset,
      parentClippingRect,
      isClipped,
      undefined,
      this.subscriptions,
    )

    const scrollPosition = createScrollPosition()
    const globalScrollMatrix = computeGlobalScrollMatrix(scrollPosition, node, globalMatrix)
    createScrollbars(
      this.propertiesSignal,
      scrollPosition,
      node,
      globalMatrix,
      isClipped,
      properties.scrollbarPanelMaterialClass,
      parentClippingRect,
      orderInfo,
      getInstancedPanelGroup,
      this.subscriptions,
    )

    const clippingRect = computeClippingRect(
      globalMatrix,
      node.size,
      node.borderInset,
      node.overflow,
      node,
      parentClippingRect,
    )

    const interactionPanel = createInteractionPanel(
      node.size,
      node,
      orderInfo,
      parentClippingRect,
      rootGroupRef,
      this.subscriptions,
    )

    setupLayoutListeners(this.listeners, node.size, this.subscriptions)
    setupViewportListeners(this.listeners, isClipped, this.subscriptions)

    this.subscriptions.push(() => {
      parentNode.removeChild(node)
      node.destroy()
    })
  }

  setProperties(properties: Properties, defaultProperties?: Properties): void {
    const merged = new MergedProperties()
    addToMerged(collection, defaultProperties, properties)
    applyPreferredColorSchemeProperties(collection, defaultProperties, properties)
    applyResponsiveProperties(collection, defaultProperties, properties, rootSize)
    const hoverHandlers = applyHoverProperties(collection, defaultProperties, properties)
    const activeHandlers = applyActiveProperties(collection, defaultProperties, properties)
    this.propertiesSignal.value = merged
  }

  destroy() {
    const subscriptionsLength = this.subscriptions.length
    for (let i = 0; i < subscriptionsLength; i++) {
      this.subscriptions[i]()
    }
  }
}
