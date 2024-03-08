import { RefObject } from 'react'
import { WithReactive } from '../properties/utils.js'
import { PanelGroupDependencies, createInteractionPanel } from '../panel/react.js'
import { FlexNode, YogaProperties } from '../flex/node.js'
import { applyHoverProperties } from '../hover.js'
import { ClippingRect, computeIsClipped, computeClippingRect } from '../clipping.js'
import { ScrollbarProperties, computeGlobalScrollMatrix, createScrollPosition, createScrollbars } from '../scroll.js'
import { WithAllAliases, panelAliasPropertyTransformation } from '../properties/alias.js'
import { InstancedPanel, PanelProperties } from '../panel/instanced-panel.js'
import { TransformProperties, computeTransformMatrix } from '../transform.js'
import { AllOptionalProperties, WithClasses } from '../properties/default.js'
import { applyResponsiveProperties } from '../responsive.js'
import { Group, Matrix4, Vector2Tuple } from 'three'
import { ElementType, computeOrderInfo } from '../order.js'
import { applyPreferredColorSchemeProperties } from '../dark.js'
import { applyActiveProperties } from '../active.js'
import { Signal } from '@preact/signals-core'
import { computeGlobalMatrix } from './utils.js'
import { WithConditionals } from '../react/utils.js'
import { Subscriptions } from '../utils.js'

export type ContainerProperties = WithConditionals<
  WithClasses<
    WithAllAliases<WithReactive<YogaProperties & PanelProperties & TransformProperties> & ScrollbarProperties>
  >
>

export function createContainer(
  parentNode: FlexNode,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  parentMatrix: Signal<Matrix4 | undefined>,
  groupRef: RefObject<Group>,
  defaultProperties: AllOptionalProperties | undefined,
  rootSize: Signal<Vector2Tuple>,
  rootGroupRef: RefObject<Group>,
): () => void {
  const subscriptions: Subscriptions = []
  const node = parentNode.createChild(propertiesSignal, groupRef, subscriptions)
  parentNode.addChild(node)

  const transformMatrix = computeTransformMatrix(node, propertiesSignal)
  const globalMatrix = computeGlobalMatrix(parentMatrix, transformMatrix)
  const isClipped = computeIsClipped(parentClippingRect, globalMatrix, node.size, node)
  const groupDeps: PanelGroupDependencies = {
    materialClass: properties.panelMaterialClass,
    castShadow: properties.castShadow,
    receiveShadow: properties.receiveShadow,
  }

  const orderInfo = computeOrderInfo(ElementType.Panel, properties.zIndexOffset, groupDeps)

  new InstancedPanel(
    propertiesSignal,
    getInstancedPanelGroup,
    orderInfo,
    panelGroupDependencies,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    parentClippingRect,
    isClipped,
    subscriptions,
    panelAliasPropertyTransformation,
  )

  const scrollPosition = createScrollPosition()
  const globalScrollMatrix = computeGlobalScrollMatrix(scrollPosition, node, globalMatrix)
  createScrollbars(
    collection,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    properties.scrollbarPanelMaterialClass,
    parentClippingRect,
    orderInfo,
  )

  //apply all properties
  addToMerged(collection, defaultProperties, properties)
  applyPreferredColorSchemeProperties(collection, defaultProperties, properties)
  applyResponsiveProperties(collection, defaultProperties, properties, rootSize)
  const hoverHandlers = applyHoverProperties(collection, defaultProperties, properties)
  const activeHandlers = applyActiveProperties(collection, defaultProperties, properties)
  finalizeCollection(collection)

  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)

  const clippingRect = computeClippingRect(
    globalMatrix,
    node.size,
    node.borderInset,
    node.overflow,
    node,
    parentClippingRect,
  )

  const interactionPanel = createInteractionPanel(node.size, node, orderInfo, rootGroupRef)

  useComponentInternals(ref, node, interactionPanel, scrollPosition)

  return () => {
    parentNode.removeChild(node)
    node.destroy()
  }
}
