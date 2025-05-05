import { YogaProperties, createFlexNodeState } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { ScrollbarProperties } from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { TransformProperties, setupObjectTransform, computedTransformMatrix } from '../transform.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { ElementType, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { createActivePropertyTransfomers } from '../active.js'
import { Signal, signal } from '@preact/signals-core'
import {
  VisibilityProperties,
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  setupNode,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
} from './utils.js'
import { Listeners, setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext } from '../context.js'
import { FrontSide, Material, Mesh, Object3D } from 'three'
import { darkPropertyTransformers } from '../dark.js'
import { PointerEventsProperties, RenderProperties, ShadowProperties, makeClippedCast } from '../panel/index.js'
import { EventHandlers, ThreeEventMap } from '../events.js'
import { abortableEffect } from '../utils.js'

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
          RenderProperties &
          PointerEventsProperties
      >
    >
  >
>

export type CustomContainerProperties<EM extends ThreeEventMap = ThreeEventMap> = InheritableCustomContainerProperties &
  Listeners &
  EventHandlers<EM>

export function createCustomContainerState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  style: Signal<CustomContainerProperties<EM> | undefined>,
  properties: Signal<CustomContainerProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
) {
  const flexState = createFlexNodeState()
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])

  //properties
  const mergedProperties = computedMergedProperties(style, properties, defaultProperties, {
    ...darkPropertyTransformers,
    ...createResponsivePropertyTransformers(parentCtx.root.size),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  })

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentCtx.root.pixelSize)
  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentCtx.clippingRect, globalMatrix, flexState.size, parentCtx.root.pixelSize)
  const isVisible = computedIsVisible(flexState, isClipped, mergedProperties)

  const orderInfo = computedOrderInfo(
    mergedProperties,
    'zIndexOffset',
    ElementType.Custom,
    undefined,
    parentCtx.orderInfo,
  )

  const handlers = computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  return Object.assign(flexState, {
    hoveredSignal,
    activeSignal,
    mergedProperties,
    transformMatrix,
    globalMatrix,
    isClipped,
    isVisible,
    orderInfo,
    handlers,
    ancestorsHaveListeners,
    root: parentCtx.root,
  })
}

export function setupCustomContainer<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createCustomContainerState>,
  parentCtx: ParentContext,
  style: Signal<CustomContainerProperties<EM> | undefined>,
  properties: Signal<CustomContainerProperties<EM> | undefined>,
  object: Object3D,
  mesh: Mesh,
  abortSignal: AbortSignal,
) {
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  //create node
  setupNode(state, parentCtx, object, true, abortSignal)

  //transform
  setupObjectTransform(parentCtx.root, object, state.transformMatrix, abortSignal)

  //setup mesh
  const clippingPlanes = createGlobalClippingPlanes(parentCtx.root, parentCtx.clippingRect)

  mesh.matrixAutoUpdate = false
  if (mesh.material instanceof Material) {
    const material = mesh.material
    material.clippingPlanes = clippingPlanes
    material.needsUpdate = true
    material.shadowSide = FrontSide
    abortableEffect(() => {
      material.depthTest = state.mergedProperties.value.read('depthTest', true)
      parentCtx.root.requestRender()
    }, abortSignal)
    abortableEffect(() => {
      material.depthWrite = state.mergedProperties.value.read('depthWrite', false)
      parentCtx.root.requestRender()
    }, abortSignal)
  }

  mesh.raycast = makeClippedCast(
    mesh,
    mesh.raycast,
    parentCtx.root.objectRef,
    parentCtx.clippingRect,
    state.orderInfo,
    state,
  )
  setupRenderOrder(mesh, parentCtx.root, state.orderInfo)

  abortableEffect(() => {
    mesh.renderOrder = state.mergedProperties.value.read('renderOrder', 0)
    parentCtx.root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    mesh.receiveShadow = state.mergedProperties.value.read('receiveShadow', false)
    parentCtx.root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    mesh.castShadow = state.mergedProperties.value.read('castShadow', false)
    parentCtx.root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    if (state.size.value == null) {
      return
    }
    const [width, height] = state.size.value
    const pixelSize = parentCtx.root.pixelSize.value
    mesh.scale.set(width * pixelSize, height * pixelSize, 1)
    mesh.updateMatrix()
    parentCtx.root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    void (mesh.visible = state.isVisible.value)
    parentCtx.root.requestRender()
  }, abortSignal)

  setupMatrixWorldUpdate(true, true, object, parentCtx.root, state.globalMatrix, false, abortSignal)

  setupPointerEvents(state.mergedProperties, state.ancestorsHaveListeners, parentCtx.root, object, true, abortSignal)

  setupLayoutListeners(style, properties, state.size, abortSignal)
  setupClippedListeners(style, properties, state.isClipped, abortSignal)
}
