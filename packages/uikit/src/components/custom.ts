import { YogaProperties, createFlexNodeState } from '../flex/node.js'
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
  VisibilityProperties,
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  createNode,
  setupMatrixWorldUpdate,
  setupInteractableDecendant,
  setupPointerEvents,
  computeOutgoingDefaultProperties,
} from './utils.js'
import { Initializers } from '../utils.js'
import { Listeners, setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { Object3DRef, ParentContext } from '../context.js'
import { FrontSide, Material, Mesh } from 'three'
import { darkPropertyTransformers } from '../dark.js'
import { RenderProperties, ShadowProperties, makeClippedCast } from '../panel/index.js'

export type InheritableCustomContainerProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          PanelProperties &
          ZIndexProperties &
          TransformProperties &
          ScrollbarProperties &
          ShadowProperties &
          VisibilityProperties &
          RenderProperties
      >
    >
  >
>

export type CustomContainerProperties = InheritableCustomContainerProperties & Listeners

export function createCustomContainer(
  parentCtx: ParentContext,
  style: Signal<CustomContainerProperties | undefined>,
  properties: Signal<CustomContainerProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  meshRef: { current?: Mesh | null },
) {
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
  const flexState = createFlexNodeState()
  createNode(undefined, flexState, parentCtx, mergedProperties, object, true, initializers)

  //transform
  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentCtx.root.pixelSize)
  applyTransform(parentCtx.root, object, transformMatrix, initializers)

  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentCtx.clippingRect, globalMatrix, flexState.size, parentCtx.root.pixelSize)
  const isVisible = computedIsVisible(flexState, isClipped, mergedProperties)

  //instanced panel
  const orderInfo = computedOrderInfo(mergedProperties, ElementType.Custom, undefined, parentCtx.orderInfo)
  const clippingPlanes = createGlobalClippingPlanes(parentCtx.root, parentCtx.clippingRect)

  initializers.push((subscriptions) => {
    const mesh = meshRef.current
    if (mesh == null) {
      return subscriptions
    }
    mesh.matrixAutoUpdate = false
    if (mesh.material instanceof Material) {
      const material = mesh.material
      material.clippingPlanes = clippingPlanes
      material.needsUpdate = true
      material.shadowSide = FrontSide
      subscriptions.push(
        () =>
          effect(() => {
            material.depthTest = mergedProperties.value.read('depthTest', true)
            parentCtx.root.requestRender()
          }),
        () =>
          effect(() => {
            material.depthWrite = mergedProperties.value.read('depthWrite', false)
            parentCtx.root.requestRender()
          }),
      )
    }
    mesh.raycast = makeClippedCast(mesh, mesh.raycast, parentCtx.root.object, parentCtx.clippingRect, orderInfo)
    setupRenderOrder(mesh, parentCtx.root, orderInfo)
    subscriptions.push(
      effect(() => {
        mesh.renderOrder = mergedProperties.value.read('renderOrder', 0)
        parentCtx.root.requestRender()
      }),
      effect(() => {
        mesh.receiveShadow = mergedProperties.value.read('receiveShadow', false)
        parentCtx.root.requestRender()
      }),
      effect(() => {
        mesh.castShadow = mergedProperties.value.read('castShadow', false)
        parentCtx.root.requestRender()
      }),
      effect(() => {
        if (flexState.size.value == null) {
          return
        }
        const [width, height] = flexState.size.value
        const pixelSize = parentCtx.root.pixelSize.value
        mesh.scale.set(width * pixelSize, height * pixelSize, 1)
        mesh.updateMatrix()
        parentCtx.root.requestRender()
      }),
      effect(() => {
        void (mesh.visible = isVisible.value)
        parentCtx.root.requestRender()
      }),
    )
    return subscriptions
  })

  setupMatrixWorldUpdate(true, true, object, parentCtx.root, globalMatrix, initializers, false)

  setupPointerEvents(mergedProperties, object, initializers)
  setupInteractableDecendant(mergedProperties, parentCtx.root, object, initializers)

  setupLayoutListeners(style, properties, flexState.size, initializers)
  setupClippedListeners(style, properties, isClipped, initializers)

  return Object.assign(flexState, {
    globalMatrix,
    isClipped,
    isVisible,
    mergedProperties,
    root: parentCtx.root,
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal),
    initializers,
  })
}
