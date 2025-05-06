import { FlexNodeState, createFlexNodeState } from '../flex/node.js'
import { setupCursorCleanup } from '../hover.js'
import { computedIsClipped, createGlobalClippingPlanes, ClippingRect } from '../clipping.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { computedTransformMatrix } from '../transform.js'
import { ElementType, OrderInfo, computedOrderInfo, setupRenderOrder } from '../order.js'
import { Signal, computed, signal } from '@preact/signals-core'
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
import { abortableEffect, alignmentZMap } from '../utils.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext } from '../context.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { Box3, Material, Mesh, Object3D, Vector3 } from 'three'
import {
  computedPanelMatrix,
  getDefaultPanelMaterialConfig,
  makeClippedCast,
  setupBoundingSphere,
} from '../panel/index.js'
import { ThreeEventMap } from '../events.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { computedRootMatrix, createRootContext, RenderContext, RootContext, setupRootContext } from './root.js'
import { Component } from '../vanilla/utils.js'

export type ContentProperties<EM extends ThreeEventMap> = AllProperties<EM, AdditionalContentProperties>

export type AdditionalContentProperties = {
  depthAlign?: keyof typeof alignmentZMap
  keepAspectRatio?: boolean
}

const additionalContentDefaults = {
  depthAlign: 'back',
  keepAspectRatio: true,
}

type AdditionalContentDefaults = typeof additionalContentDefaults & { aspectRatio: Signal<number | undefined> }

export function createContentState<EM extends ThreeEventMap = ThreeEventMap>(
  object: Component,
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = createRootContext(parentCtx, object, flexState.size, renderContext)
  const hoveredList = signal<Array<number>>([])
  const activeList = signal<Array<number>>([])

  const sizeSignal = signal(new Vector3(1, 1, 1))

  //properties
  const properties: Properties<EM, AdditionalContentProperties, Partial<AdditionalContentDefaults>> = new Properties<
    EM,
    AdditionalContentProperties,
    Partial<AdditionalContentDefaults>
  >(allAliases, createConditionals(rootContext.root.size, hoveredList, activeList), parentCtx?.properties, {
    aspectRatio: computed(() =>
      properties.get('keepAspectRatio') ? sizeSignal.value.x / sizeSignal.value.y : undefined,
    ),
    ...additionalContentDefaults,
  })

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

  const groupDeps = computedPanelGroupDependencies(properties)
  const backgroundOrderInfo = computedOrderInfo(
    properties,
    'zIndexOffset',
    ElementType.Panel,
    groupDeps,
    parentCtx?.orderInfo,
  )

  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Object, undefined, backgroundOrderInfo)

  const handlers = computedHandlers(properties, hoveredList, activeList)

  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  const measuredSize = new Vector3()
  const measuredCenter = new Vector3()

  buildRaycasting(object, rootContext.root, globalMatrix, parentCtx?.clippingRect, orderInfo, flexState)

  return Object.assign(flexState, rootContext, {
    panelMatrix: computedPanelMatrix(properties, globalMatrix, flexState.size, undefined),
    object,
    measuredSize,
    measuredCenter,
    globalMatrix,
    isClipped,
    isVisible,
    properties,
    hoveredSignal: hoveredList,
    sizeSignal,
    orderInfo,
    backgroundOrderInfo,
    groupDeps,
    handlers,
    ancestorsHaveListeners,
    transformMatrix,
    remeasureContent: createMeasureContent(
      flexState,
      measuredSize,
      measuredCenter,
      properties,
      rootContext.root,
      parentCtx?.clippingRect,
      isVisible,
      orderInfo,
      sizeSignal,
      object,
    ),
  })
}

export function setupContent(
  state: ReturnType<typeof createContentState>,
  parentCtx: ParentContext | undefined,
  abortSignal: AbortSignal,
) {
  setupRootContext(state, state.object, abortSignal)
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  //create node
  setupNode(state, parentCtx, state.object, true, abortSignal)

  //instanced panel
  setupInstancedPanel(
    state.properties,
    state.backgroundOrderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    state.panelMatrix,
    state.size,
    state.borderInset,
    parentCtx?.clippingRect,
    state.isVisible,
    getDefaultPanelMaterialConfig(),
    abortSignal,
  )

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

  setupBoundingSphere(
    state.object.boundingSphere,
    state.properties.getSignal('pixelSize'),
    state.globalMatrix,
    state.size,
    abortSignal,
  )

  setupContentContainer(state, state.object, abortSignal)
}

const vectorHelper = new Vector3()

function setupContentContainer(
  state: ReturnType<typeof createContentState>,
  object: Object3D,
  abortSignal: AbortSignal,
) {
  state.remeasureContent()
  abortableEffect(() => {
    updateRenderProperties(
      object,
      state.isVisible.value,
      state.properties.get('renderOrder'),
      state.properties.get('depthTest'),
      state.properties.get('depthWrite'),
    )
    state.root.requestRender?.()
  }, abortSignal)
  abortableEffect(() => {
    const {
      size: { value: size },
      paddingInset: { value: paddingInset },
      borderInset: { value: borderInset },
    } = state
    if (size == null || paddingInset == null || borderInset == null) {
      return
    }
    const [width, height] = size
    const [pTop, pRight, pBottom, pLeft] = paddingInset
    const [bTop, bRight, bBottom, bLeft] = borderInset
    const topInset = pTop + bTop
    const rightInset = pRight + bRight
    const bottomInset = pBottom + bBottom
    const leftInset = pLeft + bLeft

    const innerWidth = width - leftInset - rightInset
    const innerHeight = height - topInset - bottomInset

    const pixelSize = state.properties.get('pixelSize')

    //TODO: integrate this into the object transformation computation
    object.scale
      .set(
        innerWidth * pixelSize,
        innerHeight * pixelSize,
        state.properties.get('keepAspectRatio')
          ? (innerHeight * pixelSize * state.measuredSize.z) / state.measuredSize.y
          : state.measuredSize.z,
      )
      .divide(state.measuredSize)

    object.position.copy(state.measuredCenter).negate()

    object.position.z -= alignmentZMap[state.properties.get('depthAlign')] * state.measuredSize.z
    object.position.multiply(object.scale)
    object.position.add(
      vectorHelper.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0),
    )
    object.updateMatrix()
    state.root.requestRender?.()
  }, abortSignal)
}

const box3Helper = new Box3()
const smallValue = new Vector3().setScalar(0.001)

/**
 * normalizes the content so it has a height of 1
 */
function createMeasureContent(
  flexState: FlexNodeState,
  measuredSize: Vector3,
  measuredCenter: Vector3,
  properties: Properties,
  root: RootContext,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  isVisible: Signal<boolean>,
  orderInfo: Signal<OrderInfo | undefined>,
  sizeSignal: Signal<Vector3>,
  object: Object3D,
) {
  const clippingPlanes = createGlobalClippingPlanes(root, parentClippingRect)

  const measureContent = () => {
    object.traverse((child) => {
      if (child instanceof Mesh) {
        setupRenderOrder(child, root, orderInfo)
        child.material.clippingPlanes = clippingPlanes
        child.material.needsUpdate = true
        child.raycast = makeClippedCast(child, child.raycast, root.object, parentClippingRect, orderInfo, flexState)
      }
    })
    const parent = object.parent
    object.parent = null
    box3Helper.setFromObject(object)
    box3Helper.getSize(measuredSize).max(smallValue)
    sizeSignal.value = measuredSize

    if (parent != null) {
      object.parent = parent
    }
    box3Helper.getCenter(measuredCenter)
    root.requestRender?.()
  }
  return () => {
    updateRenderProperties(
      object,
      isVisible.peek(),
      properties.peek('renderOrder'),
      properties.peek('depthTest'),
      properties.peek('depthWrite'),
    )
    measureContent()
  }
}

function updateRenderProperties(
  object: Object3D,
  visible: boolean,
  renderOrder: number,
  depthTest: boolean,
  depthWrite: boolean,
) {
  object.visible = visible
  object.traverse((child) => {
    if (!(child instanceof Mesh)) {
      return
    }
    child.renderOrder = renderOrder
    if (!(child.material instanceof Material)) {
      return
    }
    child.material.depthTest = depthTest
    child.material.depthWrite = depthWrite
    child.material.transparent = true
  })
}
