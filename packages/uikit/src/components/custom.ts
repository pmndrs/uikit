import { createFlexNodeState } from '../flex/node.js'
import { setupCursorCleanup } from '../hover.js'
import { computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { setupObjectTransform, computedTransformMatrix } from '../transform.js'
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
} from './utils.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext } from '../context.js'
import { FrontSide, Material, Mesh, Object3D } from 'three'
import { makeClippedCast } from '../panel/index.js'
import { ThreeEventMap } from '../events.js'
import { abortableEffect } from '../utils.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'

export type CustomContainerProperties<EM extends ThreeEventMap> = AllProperties<EM, {}>

export function createCustomContainerState<EM extends ThreeEventMap = ThreeEventMap>(parentCtx: ParentContext) {
  const flexState = createFlexNodeState()
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])

  //properties
  const properties = new Properties<EM>(
    allAliases,
    createConditionals(parentCtx.root.size, hoveredSignal, activeSignal),
    parentCtx.properties,
    {},
  )

  const transformMatrix = computedTransformMatrix(properties, flexState)
  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(
    parentCtx.clippingRect,
    globalMatrix,
    flexState.size,
    properties.getSignal('pixelSize'),
  )
  const isVisible = computedIsVisible(flexState, isClipped, properties)

  const orderInfo = computedOrderInfo(properties, 'zIndexOffset', ElementType.Custom, undefined, parentCtx.orderInfo)

  const handlers = computedHandlers(properties, hoveredSignal, activeSignal)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  return Object.assign(flexState, {
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
    root: parentCtx.root,
  })
}

export function setupCustomContainer(
  state: ReturnType<typeof createCustomContainerState>,
  parentCtx: ParentContext,
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
      material.depthTest = state.properties.get('depthTest')
      parentCtx.root.requestRender()
    }, abortSignal)
    abortableEffect(() => {
      material.depthWrite = state.properties.get('depthWrite')
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
    mesh.renderOrder = state.properties.get('renderOrder')
    parentCtx.root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    mesh.receiveShadow = state.properties.get('receiveShadow')
    parentCtx.root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    mesh.castShadow = state.properties.get('castShadow')
    parentCtx.root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    if (state.size.value == null) {
      return
    }
    const [width, height] = state.size.value
    const pixelSize = state.properties.get('pixelSize')
    mesh.scale.set(width * pixelSize, height * pixelSize, 1)
    mesh.updateMatrix()
    parentCtx.root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    void (mesh.visible = state.isVisible.value)
    parentCtx.root.requestRender()
  }, abortSignal)

  setupMatrixWorldUpdate(true, true, object, parentCtx.root, state.globalMatrix, false, abortSignal)

  setupPointerEvents(state.properties, state.ancestorsHaveListeners, parentCtx.root, object, true, abortSignal)

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)
}
