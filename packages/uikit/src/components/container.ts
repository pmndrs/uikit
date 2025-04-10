import { createFlexNodeState } from '../flex/node.js'
import { setupCursorCleanup } from '../hover.js'
import { computedIsClipped, computedClippingRect } from '../clipping.js'
import {
  computedAnyAncestorScrollable,
  computedGlobalScrollMatrix,
  computedScrollHandlers,
  createScrollPosition,
  createScrollState,
  setupScroll,
  setupScrollbars,
} from '../scroll.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { setupObjectTransform, computedTransformMatrix } from '../transform.js'
import { ElementType, computedOrderInfo } from '../order.js'
import { Signal, signal } from '@preact/signals-core'
import {
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  setupNode,
  setupMatrixWorldUpdate,
  computedAncestorsHaveListeners,
  setupPointerEvents,
} from './utils.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext } from '../context.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { getDefaultPanelMaterialConfig } from '../panel/index.js'
import { Object3D } from 'three'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { ThreeEventMap } from '../events.js'
import { computedFontFamilies } from '../text/font.js'

export type ContainerProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, {}>

export function createContainerState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  objectRef: { current?: Object3D | null },
) {
  const flexState = createFlexNodeState()
  const hoveredList = signal<Array<number>>([])
  const activeList = signal<Array<number>>([])

  //properties
  const properties = new Properties<EM, {}, {}>(
    allAliases,
    createConditionals(parentCtx.root.size, hoveredList, activeList),
    parentCtx.properties,
    {},
  )

  //transform
  const transformMatrix = computedTransformMatrix(properties, flexState)

  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(
    parentCtx.clippingRect,
    globalMatrix,
    flexState.size,
    properties.getSignal('pixelSize'),
  )

  const isVisible = computedIsVisible(flexState, isClipped, properties)

  //instanced panel
  const groupDeps = computedPanelGroupDependencies(properties)
  const scrollPosition = createScrollPosition()

  const orderInfo = computedOrderInfo(properties, 'zIndexOffset', ElementType.Panel, groupDeps, parentCtx.orderInfo)

  const componentState = Object.assign(flexState, {
    scrollState: createScrollState(),
    properties,
    transformMatrix,
    hoveredList,
    globalMatrix,
    isClipped,
    isVisible,
    scrollPosition,
    groupDeps,
    orderInfo,
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx.anyAncestorScrollable),
    clippingRect: computedClippingRect(
      globalMatrix,
      flexState,
      properties.getSignal('pixelSize'),
      parentCtx.clippingRect,
    ),
    childrenMatrix: computedGlobalScrollMatrix(properties, scrollPosition, globalMatrix),
    root: parentCtx.root,
  })

  const scrollHandlers = computedScrollHandlers(componentState, objectRef)

  const handlers = computedHandlers(properties, hoveredList, activeList, scrollHandlers)
  return Object.assign(componentState, {
    interactionPanel: createInteractionPanel(
      orderInfo,
      parentCtx.root,
      parentCtx.clippingRect,
      globalMatrix,
      flexState,
    ),
    fontFamilies: computedFontFamilies(properties, parentCtx),
    handlers,
    ancestorsHaveListeners: computedAncestorsHaveListeners(parentCtx, handlers),
  }) satisfies ParentContext
}

export function setupContainer(
  state: ReturnType<typeof createContainerState>,
  parentCtx: ParentContext,
  object: Object3D,
  childrenContainer: Object3D,
  abortSignal: AbortSignal,
) {
  setupNode(state, parentCtx, object, false, abortSignal)

  setupObjectTransform(state.root, object, state.transformMatrix, abortSignal)
  setupCursorCleanup(state.hoveredList, abortSignal)

  setupInstancedPanel(
    state.properties,
    state.orderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    state.globalMatrix,
    state.size,
    undefined,
    state.borderInset,
    parentCtx.clippingRect,
    state.isVisible,
    getDefaultPanelMaterialConfig(),
    abortSignal,
  )

  //scrolling:
  setupScroll(state, childrenContainer, abortSignal)
  setupScrollbars(
    state.properties,
    state.scrollPosition,
    state,
    state.globalMatrix,
    state.isVisible,
    parentCtx.clippingRect,
    state.orderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    abortSignal,
  )

  setupInteractionPanel(state.properties, state.interactionPanel, state.globalMatrix, state.size, abortSignal)
  setupPointerEvents(
    state.properties,
    state.ancestorsHaveListeners,
    state.root,
    state.interactionPanel,
    false,
    abortSignal,
  )

  const updateMatrixWorld = state.properties.getSignal('updateMatrixWorld')
  setupMatrixWorldUpdate(updateMatrixWorld, false, object, state.root, state.globalMatrix, false, abortSignal)
  setupMatrixWorldUpdate(
    updateMatrixWorld,
    false,
    state.interactionPanel,
    state.root,
    state.globalMatrix,
    true,
    abortSignal,
  )

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)
}
