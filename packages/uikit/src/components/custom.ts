import { createFlexNodeState } from '../flex/node.js'
import { setupCursorCleanup } from '../hover.js'
import { computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { computedTransformMatrix } from '../transform.js'
import { ElementType, computedOrderInfo, setupRenderOrder } from '../order.js'
import { signal } from '@preact/signals-core'
import {
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  setupNode,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
  buildRaycasting,
} from './utils.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext } from '../context.js'
import { FrontSide, Material } from 'three'
import { ThreeEventMap } from '../events.js'
import { abortableEffect } from '../utils.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { computedRootMatrix, createRootContext, RenderContext, setupRootContext } from './root.js'
import { Component } from '../vanilla/utils.js'

export type CustomContainerProperties<EM extends ThreeEventMap> = AllProperties<EM, {}>

export function createCustomContainerState<EM extends ThreeEventMap = ThreeEventMap>(
  object: Component,
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = createRootContext(parentCtx, object, flexState.size, renderContext)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])

  //properties
  const properties = new Properties<EM>(
    allAliases,
    createConditionals(rootContext.root.size, hoveredSignal, activeSignal),
    parentCtx?.properties,
    {},
  )

  const transformMatrix = computedTransformMatrix(properties, flexState)
  const globalMatrix = computedGlobalMatrix(
    parentCtx?.childrenMatrix ?? computedRootMatrix(properties, rootContext.root.size),
    transformMatrix,
  )

  const isClipped = computedIsClipped(
    parentCtx?.clippingRect,
    globalMatrix,
    flexState.size,
    properties.getSignal('pixelSize'),
  )
  const isVisible = computedIsVisible(flexState, isClipped, properties)

  const orderInfo = computedOrderInfo(properties, 'zIndexOffset', ElementType.Custom, undefined, parentCtx?.orderInfo)

  const handlers = computedHandlers(properties, hoveredSignal, activeSignal)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  buildRaycasting(object, rootContext.root, globalMatrix, parentCtx?.clippingRect, orderInfo, flexState)

  return Object.assign(flexState, rootContext, {
    object,
    hoveredSignal,
    activeSignal,
    properties,
    transformMatrix,
    globalMatrix,
    isClipped,
    isVisible,
    orderInfo,
    handlers,
    ancestorsHaveListeners,
  })
}

export function setupCustomContainer(
  state: ReturnType<typeof createCustomContainerState>,
  parentCtx: ParentContext | undefined,
  abortSignal: AbortSignal,
) {
  setupRootContext(state, state.object, abortSignal)
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  //create node
  setupNode(state, parentCtx, state.object, true, abortSignal)

  //setup mesh
  const clippingPlanes = createGlobalClippingPlanes(state.root, parentCtx?.clippingRect)

  state.object.matrixAutoUpdate = false
  if (state.object.material instanceof Material) {
    const material = state.object.material
    material.clippingPlanes = clippingPlanes
    material.needsUpdate = true
    material.shadowSide = FrontSide
    abortableEffect(() => {
      material.depthTest = state.properties.get('depthTest')
      state.root.requestRender?.()
    }, abortSignal)
    abortableEffect(() => {
      material.depthWrite = state.properties.get('depthWrite')
      state.root.requestRender?.()
    }, abortSignal)
  }

  setupRenderOrder(state.object, state.root, state.orderInfo)

  abortableEffect(() => {
    state.object.renderOrder = state.properties.get('renderOrder')
    state.root.requestRender?.()
  }, abortSignal)
  abortableEffect(() => {
    state.object.receiveShadow = state.properties.get('receiveShadow')
    state.root.requestRender?.()
  }, abortSignal)
  abortableEffect(() => {
    state.object.castShadow = state.properties.get('castShadow')
    state.root.requestRender?.()
  }, abortSignal)
  abortableEffect(() => {
    void (state.object.visible = state.isVisible.value)
    state.root.requestRender?.()
  }, abortSignal)

  setupMatrixWorldUpdate(
    true,
    true,
    state.properties,
    state.size,
    state.object,
    state.root,
    state.globalMatrix,
    abortSignal,
  )

  setupPointerEvents(state.properties, state.ancestorsHaveListeners, state.root, state.object, true, abortSignal)

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)
}
