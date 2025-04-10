import { FlexNodeState, createFlexNodeState } from '../flex/node.js'
import { setupCursorCleanup } from '../hover.js'
import { computedIsClipped, createGlobalClippingPlanes, ClippingRect } from '../clipping.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { setupObjectTransform, computedTransformMatrix } from '../transform.js'
import { ElementType, OrderInfo, computedOrderInfo, setupRenderOrder } from '../order.js'
import { Signal, computed, signal, untracked } from '@preact/signals-core'
import {
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  setupNode,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
} from './utils.js'
import { abortableEffect, alignmentZMap } from '../utils.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext, RootContext } from '../context.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { Box3, Material, Mesh, Object3D, Vector3 } from 'three'
import { getDefaultPanelMaterialConfig, makeClippedCast } from '../panel/index.js'
import { ThreeEventMap } from '../events.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'

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
  parentCtx: ParentContext,
  contentContainerRef: { current?: Object3D | null },
) {
  const flexState = createFlexNodeState()
  const hoveredList = signal<Array<number>>([])
  const activeList = signal<Array<number>>([])

  const sizeSignal = signal(new Vector3(1, 1, 1))

  //properties
  const properties: Properties<EM, AdditionalContentProperties, Partial<AdditionalContentDefaults>> = new Properties<
    EM,
    AdditionalContentProperties,
    Partial<AdditionalContentDefaults>
  >(allAliases, createConditionals(parentCtx.root.size, hoveredList, activeList), parentCtx.properties, {
    aspectRatio: computed(() =>
      properties.get('keepAspectRatio') ? sizeSignal.value.x / sizeSignal.value.y : undefined,
    ),
    ...additionalContentDefaults,
  })

  const transformMatrix = computedTransformMatrix(properties, flexState)

  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(
    parentCtx.clippingRect,
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
    parentCtx.orderInfo,
  )

  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Object, undefined, backgroundOrderInfo)

  const handlers = computedHandlers(properties, hoveredList, activeList)

  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  const measuredSize = new Vector3()
  const measuredCenter = new Vector3()

  return Object.assign(flexState, {
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
    root: parentCtx.root,
    interactionPanel: createInteractionPanel(
      backgroundOrderInfo,
      parentCtx.root,
      parentCtx.clippingRect,
      globalMatrix,
      flexState,
    ),
    remeasureContent: createMeasureContent(
      flexState,
      measuredSize,
      measuredCenter,
      properties,
      parentCtx.root,
      parentCtx.clippingRect,
      isVisible,
      orderInfo,
      sizeSignal,
      contentContainerRef,
    ),
  })
}

export function setupContent(
  state: ReturnType<typeof createContentState>,
  parentCtx: ParentContext,
  object: Object3D,
  contentContainer: Object3D,
  abortSignal: AbortSignal,
) {
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  //create node
  setupNode(state, parentCtx, object, true, abortSignal)

  //transform
  setupObjectTransform(parentCtx.root, object, state.transformMatrix, abortSignal)

  //instanced panel
  setupInstancedPanel(
    state.properties,
    state.backgroundOrderInfo,
    state.groupDeps,
    parentCtx.root.panelGroupManager,
    state.globalMatrix,
    state.size,
    undefined,
    state.borderInset,
    parentCtx.clippingRect,
    state.isVisible,
    getDefaultPanelMaterialConfig(),
    abortSignal,
  )

  setupMatrixWorldUpdate(true, true, object, parentCtx.root, state.globalMatrix, false, abortSignal)

  setupPointerEvents(state.properties, state.ancestorsHaveListeners, parentCtx.root, object, true, abortSignal)

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)

  setupInteractionPanel(state.properties, state.interactionPanel, state.globalMatrix, state.size, abortSignal)

  setupContentContainer(state, contentContainer, abortSignal)
}

const vectorHelper = new Vector3()

function setupContentContainer<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createContentState>,
  contentContainer: Object3D,
  abortSignal: AbortSignal,
) {
  state.remeasureContent()
  abortableEffect(() => {
    updateRenderProperties(
      { current: contentContainer },
      state.isVisible.value,
      state.properties.get('renderOrder'),
      state.properties.get('depthTest'),
      state.properties.get('depthWrite'),
    )
    state.root.requestRender()
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
    contentContainer.scale
      .set(
        innerWidth * pixelSize,
        innerHeight * pixelSize,
        state.properties.get('keepAspectRatio')
          ? (innerHeight * pixelSize * state.measuredSize.z) / state.measuredSize.y
          : state.measuredSize.z,
      )
      .divide(state.measuredSize)

    contentContainer.position.copy(state.measuredCenter).negate()

    contentContainer.position.z -= alignmentZMap[state.properties.get('depthAlign')] * state.measuredSize.z
    contentContainer.position.multiply(contentContainer.scale)
    contentContainer.position.add(
      vectorHelper.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0),
    )
    contentContainer.updateMatrix()
    state.root.requestRender()
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
  parentClippingRect: Signal<ClippingRect | undefined>,
  isVisible: Signal<boolean>,
  orderInfo: Signal<OrderInfo | undefined>,
  sizeSignal: Signal<Vector3>,
  contentContainerRef: { current?: Object3D | null },
) {
  const clippingPlanes = createGlobalClippingPlanes(root, parentClippingRect)

  const measureContent = () => {
    const contentContainer = contentContainerRef.current
    if (contentContainer == null) {
      return
    }
    contentContainer.traverse((object) => {
      if (object instanceof Mesh) {
        setupRenderOrder(object, root, orderInfo)
        object.material.clippingPlanes = clippingPlanes
        object.material.needsUpdate = true
        object.raycast = makeClippedCast(
          object,
          object.raycast,
          root.objectRef,
          parentClippingRect,
          orderInfo,
          flexState,
        )
      }
    })
    const parent = contentContainer.parent
    contentContainer.parent = null
    box3Helper.setFromObject(contentContainer)
    box3Helper.getSize(measuredSize).max(smallValue)
    sizeSignal.value = measuredSize

    if (parent != null) {
      contentContainer.parent = parent
    }
    box3Helper.getCenter(measuredCenter)
    root.requestRender()
  }
  return () => {
    updateRenderProperties(
      contentContainerRef,
      isVisible.peek(),
      properties.peek('renderOrder'),
      properties.peek('depthTest'),
      properties.peek('depthWrite'),
    )
    measureContent()
  }
}

function updateRenderProperties(
  contentContainerRef: { current?: Object3D | null },
  visible: boolean,
  renderOrder: number,
  depthTest: boolean,
  depthWrite: boolean,
) {
  const contentContainer = contentContainerRef.current
  if (contentContainer == null) {
    return
  }
  contentContainer.visible = visible
  contentContainer.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return
    }
    object.renderOrder = renderOrder
    if (!(object.material instanceof Material)) {
      return
    }
    object.material.depthTest = depthTest
    object.material.depthWrite = depthWrite
    object.material.transparent = true
  })
}
