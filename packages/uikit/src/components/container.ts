import { setupCursorCleanup } from '../hover.js'
import { computedIsClipped, computedClippingRect } from '../clipping.js'
import {
  computedAnyAncestorScrollable,
  computedGlobalScrollMatrix,
  computedScrollHandlers,
  setupScroll,
  setupScrollbars,
} from '../scroll.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { computedTransformMatrix } from '../transform.js'
import { ElementType, computedOrderInfo } from '../order.js'
import { signal } from '@preact/signals-core'
import {
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  setupMatrixWorldUpdate,
  computedAncestorsHaveListeners,
  setupPointerEvents,
  buildRaycasting,
} from './utils.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { computedPanelMatrix, getDefaultPanelMaterialConfig, setupBoundingSphere } from '../panel/index.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { ThreeEventMap } from '../events.js'
import { computedFontFamilies } from '../text/font.js'


export function createContainerState<EM extends ThreeEventMap = ThreeEventMap>(
  object: Component,
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = setupRootContext(parentCtx, object, flexState.size, renderContext)
  const hoveredList = signal<Array<number>>([])
  const activeList = signal<Array<number>>([])

  //properties
  const properties = new Properties<EM, {}, {}>(
    allAliases,
    createConditionals(rootContext.root.size, hoveredList, activeList),
    parentCtx?.properties,
    {},
  )

  //transform
  const transformMatrix = computedTransformMatrix(properties, flexState)

  const globalMatrix = computedGlobalMatrix(
    parentCtx?.childrenMatrix ?? buildRootMatrix(properties, rootContext.root.size),
    transformMatrix,
  )

  const isClipped = computedIsClipped(
    parentCtx?.clippingRect,
    globalMatrix,
    flexState.size,
    properties.getSignal('pixelSize'),
  )

  const isVisible = computedIsVisible(flexState, isClipped, properties)

  //instanced panel
  const groupDeps = computedPanelGroupDependencies(properties)
  const scrollPosition = createScrollPosition()

  const orderInfo = computedOrderInfo(properties, 'zIndexOffset', ElementType.Panel, groupDeps, parentCtx?.orderInfo)

  buildRaycasting(object, rootContext.root, globalMatrix, parentCtx?.clippingRect, orderInfo, flexState)

  const componentState = Object.assign(flexState, rootContext, {
    object,
    panelMatrix: computedPanelMatrix(properties, globalMatrix, flexState.size, undefined),
    scrollState: createScrollState(),
    properties,
    hoveredList,
    globalMatrix,
    isClipped,
    isVisible,
    scrollPosition,
    groupDeps,
    orderInfo,
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx?.anyAncestorScrollable),
    clippingRect: computedClippingRect(
      globalMatrix,
      flexState,
      properties.getSignal('pixelSize'),
      parentCtx?.clippingRect,
    ),
    childrenMatrix: computedGlobalScrollMatrix(properties, scrollPosition, globalMatrix),
  })

  const scrollHandlers = computedScrollHandlers(componentState, object)

  const handlers = computedHandlers(properties, hoveredList, activeList, scrollHandlers)
  return Object.assign(componentState, {
    fontFamilies: computedFontFamilies(properties, parentCtx),
    handlers,
    ancestorsHaveListeners: computedAncestorsHaveListeners(parentCtx, handlers),
  }) satisfies ParentContext
}

export function setupContainer(
  state: ReturnType<typeof createContainerState>,
  parentCtx: ParentContext | undefined,
  abortSignal: AbortSignal,
) {
  setupRootContext(state, state.object, abortSignal)

  createNode(state, parentCtx, state.object, false, abortSignal)
  setupCursorCleanup(state.hoveredList, abortSignal)

  setupInstancedPanel(
    state.properties,
    state.orderInfo,
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

  //scrolling:
  setupScroll(state, abortSignal)
  setupScrollbars(
    state.properties,
    state.scrollPosition,
    state,
    state.globalMatrix,
    state.isVisible,
    parentCtx?.clippingRect,
    state.orderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    abortSignal,
  )

  setupBoundingSphere(
    state.object.boundingSphere,
    state.properties.getSignal('pixelSize'),
    state.globalMatrix,
    state.size,
    abortSignal,
  )
  setupPointerEvents(state.properties, state.ancestorsHaveListeners, state.root, state.object, false, abortSignal)

  const updateMatrixWorld = state.properties.getSignal('updateMatrixWorld')
  setupMatrixWorldUpdate(
    updateMatrixWorld,
    false,
    state.properties,
    state.size,
    state.object,
    state.root,
    state.globalMatrix,
    abortSignal,
  )

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)
}
