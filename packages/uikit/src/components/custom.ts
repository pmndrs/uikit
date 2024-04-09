import { YogaProperties } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { ScrollbarProperties } from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { ElementType, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { createActivePropertyTransfomers } from '../active.js'
import { Signal, effect, signal } from '@preact/signals-core'
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
import { ShadowProperties, darkPropertyTransformers, makeClippedRaycast } from '../internals.js'
import { FrontSide, Material, Mesh } from 'three'

export type InheritableCustomContainerProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          PanelProperties &
          ZIndexProperties &
          TransformProperties &
          ScrollbarProperties &
          ShadowProperties
      >
    >
  >
>

export type CustomContainerProperties = InheritableCustomContainerProperties & Listeners

export function createCustomContainer(
  parentContext: ParentContext,
  style: Signal<CustomContainerProperties | undefined>,
  properties: Signal<CustomContainerProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
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
  const orderInfo = computedOrderInfo(mergedProperties, ElementType.Custom, undefined, parentContext.orderInfo)

  const setupMesh = (mesh: Mesh, subscriptions: Subscriptions) => {
    mesh.matrixAutoUpdate = false
    mesh.raycast = makeClippedRaycast(
      mesh,
      mesh.raycast,
      parentContext.root.object,
      parentContext.clippingRect,
      orderInfo,
    )
    setupRenderOrder(mesh, parentContext.root, orderInfo)
    subscriptions.push(
      effect(() => (mesh.receiveShadow = mergedProperties.value.read('receiveShadow', false))),
      effect(() => (mesh.castShadow = mergedProperties.value.read('castShadow', false))),
      effect(() => {
        const [width, height] = node.size.value
        const pixelSize = parentContext.root.pixelSize
        mesh.scale.set(width * pixelSize, height * pixelSize, 1)
        mesh.updateMatrix()
      }),
      effect(() => void (mesh.visible = !isClipped.value)),
    )
  }

  const clippingPlanes = createGlobalClippingPlanes(parentContext.root, parentContext.clippingRect, subscriptions)
  const setupMaterial = (material: Material) => {
    material.clippingPlanes = clippingPlanes
    material.needsUpdate = true
    material.shadowSide = FrontSide
  }

  setupLayoutListeners(style, properties, node.size, subscriptions)
  setupViewportListeners(style, properties, isClipped, subscriptions)

  return {
    root: parentContext.root,
    setupMesh,
    setupMaterial,
    node,
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal),
    subscriptions,
  }
}
