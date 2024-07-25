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
} from './utils.js'
import { Initializers } from '../utils.js'
import { Listeners, setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { Object3DRef, ParentContext } from '../context.js'
import { FrontSide, Material, Mesh } from 'three'
import { darkPropertyTransformers } from '../dark.js'
import { ShadowProperties, makeClippedCast } from '../panel/index.js'

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
          VisibilityProperties
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
  meshRef: { current?: Mesh | null },
) {
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const initializers: Initializers = []

  setupCursorCleanup(hoveredSignal, initializers)

  //properties
  const mergedProperties = computedMergedProperties(style, properties, defaultProperties, {
    ...darkPropertyTransformers,
    ...createResponsivePropertyTransformers(parentContext.root.size),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  })

  //create node
  const flexState = createFlexNodeState()
  createNode(undefined, flexState, parentContext, mergedProperties, object, true, initializers)

  //transform
  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentContext.root.pixelSize)
  applyTransform(parentContext.root, object, transformMatrix, initializers)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(
    parentContext.clippingRect,
    globalMatrix,
    flexState.size,
    parentContext.root.pixelSize,
  )
  const isVisible = computedIsVisible(flexState, isClipped, mergedProperties)

  //instanced panel
  const orderInfo = computedOrderInfo(mergedProperties, ElementType.Custom, undefined, parentContext.orderInfo)
  const clippingPlanes = createGlobalClippingPlanes(parentContext.root, parentContext.clippingRect)

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
      subscriptions.push(() =>
        effect(() => {
          material.depthTest = parentContext.root.depthTest.value
          parentContext.root.requestRender()
        }),
      )
    }
    mesh.raycast = makeClippedCast(mesh, mesh.raycast, parentContext.root.object, parentContext.clippingRect, orderInfo)
    setupRenderOrder(mesh, parentContext.root, orderInfo)
    subscriptions.push(
      effect(() => {
        mesh.renderOrder = parentContext.root.renderOrder.value
        parentContext.root.requestRender()
      }),
      effect(() => {
        mesh.receiveShadow = mergedProperties.value.read('receiveShadow', false)
        parentContext.root.requestRender()
      }),
      effect(() => {
        mesh.castShadow = mergedProperties.value.read('castShadow', false)
        parentContext.root.requestRender()
      }),
      effect(() => {
        if (flexState.size.value == null) {
          return
        }
        const [width, height] = flexState.size.value
        const pixelSize = parentContext.root.pixelSize.value
        mesh.scale.set(width * pixelSize, height * pixelSize, 1)
        mesh.updateMatrix()
        parentContext.root.requestRender()
      }),
      effect(() => {
        void (mesh.visible = isVisible.value)
        parentContext.root.requestRender()
      }),
    )
    return subscriptions
  })

  setupLayoutListeners(style, properties, flexState.size, initializers)
  setupClippedListeners(style, properties, isClipped, initializers)

  return Object.assign(flexState, {
    isClipped,
    mergedProperties,
    root: parentContext.root,
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal),
    initializers,
  })
}
