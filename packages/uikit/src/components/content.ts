import { YogaProperties } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped, computedClippingRect, createGlobalClippingPlanes, ClippingRect } from '../clipping.js'
import { ScrollbarProperties } from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties, createInstancedPanel } from '../panel/instanced-panel.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { createActivePropertyTransfomers } from '../active.js'
import { Signal, computed, effect, signal } from '@preact/signals-core'
import {
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedMergedProperties,
  createNode,
  keepAspectRatioPropertyTransformer,
} from './utils.js'
import { Subscriptions, alignmentZMap } from '../utils.js'
import { Listeners, setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { Object3DRef, ParentContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import {
  FlexNode,
  KeepAspectRatioProperties,
  MergedProperties,
  RootContext,
  computedProperty,
  darkPropertyTransformers,
  getDefaultPanelMaterialConfig,
  makeClippedRaycast,
} from '../internals.js'
import { Box3, Mesh, Object3D, Vector3 } from 'three'

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
          KeepAspectRatioProperties
      >
    >
  >
>

export type DepthAlignProperties = {
  depthAlign?: keyof typeof alignmentZMap
}

export type ContentProperties = InheritableContentProperties & Listeners

export function createContent(
  parentContext: ParentContext,
  properties: Signal<ContentProperties>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
) {
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const subscriptions = [] as Subscriptions

  setupCursorCleanup(hoveredSignal, subscriptions)

  const sizeSignal = signal(new Vector3(1, 1, 1))
  const aspectRatio = computed(() => sizeSignal.value.x / sizeSignal.value.y)

  //properties
  const mergedProperties = computedMergedProperties(
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(parentContext.root.node.size),
      ...createHoverPropertyTransformers(hoveredSignal),
      ...createActivePropertyTransfomers(activeSignal),
    },
    keepAspectRatioPropertyTransformer,
    (m) => m.add('aspectRatio', aspectRatio),
  )

  //create node
  const node = createNode(parentContext, mergedProperties, object, subscriptions)

  //transform
  const transformMatrix = computedTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)

  //instanced panel
  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const backgroundorderInfo = computedOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentContext.orderInfo)
  createInstancedPanel(
    mergedProperties,
    backgroundorderInfo,
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

  const orderInfo = computedOrderInfo(undefined, ElementType.Object, undefined, backgroundorderInfo)

  setupLayoutListeners(properties, node.size, subscriptions)
  setupViewportListeners(properties, isClipped, subscriptions)

  return {
    setupContent: createSetupContent(
      mergedProperties,
      parentContext.root,
      node,
      parentContext.clippingRect,
      orderInfo,
      sizeSignal,
      subscriptions,
    ),
    clippingRect: computedClippingRect(
      globalMatrix,
      node.size,
      node.borderInset,
      node.overflow,
      parentContext.root.pixelSize,
      parentContext.clippingRect,
    ),
    root: parentContext.root,
    node,
    interactionPanel: createInteractionPanel(
      node,
      backgroundorderInfo,
      parentContext.root,
      parentContext.clippingRect,
      subscriptions,
    ),
    handlers: computedHandlers(properties, defaultProperties, hoveredSignal, activeSignal),
    subscriptions,
  }
}

const box3Helper = new Box3()
const smallValue = new Vector3().setScalar(0.001)
const vectorHelper = new Vector3()

const defaultDepthAlign: keyof typeof alignmentZMap = 'back'

/**
 * normalizes the content so it has a height of 1
 */
function createSetupContent(
  propertiesSignal: Signal<MergedProperties>,
  root: RootContext,
  node: FlexNode,
  parentClippingRect: Signal<ClippingRect | undefined>,
  orderInfo: Signal<OrderInfo>,
  sizeSignal: Signal<Vector3>,
  subscriptions: Subscriptions,
) {
  const clippingPlanes = createGlobalClippingPlanes(root, parentClippingRect, subscriptions)
  const depthAlign = computedProperty(propertiesSignal, 'depthAlign', defaultDepthAlign)
  const keepAspectRatio = computedProperty(propertiesSignal, 'keepAspectRatio', true)
  return (content: Object3D, subscriptions: Subscriptions) => {
    content.traverse((object) => {
      if (object instanceof Mesh) {
        setupRenderOrder(object, root, orderInfo)
        object.material.clippingPlanes = clippingPlanes
        object.material.needsUpdate = true
        object.raycast = makeClippedRaycast(object, object.raycast, root.object, parentClippingRect, orderInfo)
      }
    })
    const parent = content.parent
    content.parent = null
    box3Helper.setFromObject(content)
    const size = new Vector3()
    const center = new Vector3()
    box3Helper.getSize(size).max(smallValue)
    sizeSignal.value = size

    if (parent != null) {
      content.parent = parent
    }
    box3Helper.getCenter(center)
    subscriptions.push(
      effect(() => {
        const [width, height] = node.size.value
        const [pTop, pRight, pBottom, pLeft] = node.paddingInset.value
        const [bTop, bRight, bBottom, bLeft] = node.borderInset.value
        const topInset = pTop + bTop
        const rightInset = pRight + bRight
        const bottomInset = pBottom + bBottom
        const leftInset = pLeft + bLeft

        const innerWidth = width - leftInset - rightInset
        const innerHeight = height - topInset - bottomInset

        const pixelSize = root.pixelSize
        content.scale
          .set(
            innerWidth * pixelSize,
            innerHeight * pixelSize,
            keepAspectRatio.value ? (innerHeight * pixelSize * size.z) / size.y : size.z,
          )
          .divide(size)

        content.position.copy(center).negate()

        content.position.z -= alignmentZMap[depthAlign.value] * size.z
        content.position.multiply(content.scale)
        content.position.add(
          vectorHelper.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0),
        )
        content.updateMatrix()
      }),
    )
  }
}
