import { setupCursorCleanup } from '../hover.js'
import { computedIsClipped } from '../clipping.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { computedTransformMatrix } from '../transform.js'
import { ElementType } from '../order.js'
import { Signal, signal } from '@preact/signals-core'
import {
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  setupPointerEvents,
  setupMatrixWorldUpdate,
  computedAncestorsHaveListeners,
  buildRaycasting,
} from './utils.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { computedPanelMatrix, getDefaultPanelMaterialConfig, setupBoundingSphere } from '../panel/index.js'
import {
  AdditionalTextDefaults,
  AdditionalTextProperties,
  additionalTextDefaults,
  computedFont,
  computedFontFamilies,
  computedGylphGroupDependencies,
  createInstancedText,
} from '../text/index.js'
import { ThreeEventMap } from '../events.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { abortableEffect } from '../utils.js'

export type TextProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, {}>

export function createTextState<EM extends ThreeEventMap = ThreeEventMap>(
  object: Component,
  textSignal: Signal<unknown | Signal<unknown> | Array<unknown | Signal<unknown>>>,
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = setupRootContext(parentCtx, object, flexState.size, renderContext)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])

  const properties = new Properties<EM, AdditionalTextProperties, AdditionalTextDefaults>(
    allAliases,
    createConditionals(rootContext.root.size, hoveredSignal, activeSignal),
    parentCtx?.properties,
    additionalTextDefaults,
  )

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

  const groupDeps = computedPanelGroupDependencies(properties)
  const backgroundOrderInfo = computedOrderInfo(
    properties,
    'zIndexOffset',
    ElementType.Panel,
    groupDeps,
    parentCtx?.orderInfo,
  )

  const fontFamilies = computedFontFamilies(properties, parentCtx)

  const fontSignal = computedFont(properties, fontFamilies)
  const orderInfo = computedOrderInfo(
    undefined,
    'zIndexOffset',
    ElementType.Text,
    computedGylphGroupDependencies(fontSignal),
    backgroundOrderInfo,
  )

  const handlers = computedHandlers(properties, hoveredSignal, activeSignal)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  buildRaycasting(object, rootContext.root, globalMatrix, parentCtx?.clippingRect, orderInfo, flexState)

  return Object.assign(flexState, rootContext, {
    panelMatrix: computedPanelMatrix(properties, globalMatrix, flexState.size, undefined),
    object,
    hoveredSignal,
    activeSignal,
    properties,
    transformMatrix,
    globalMatrix,
    isClipped,
    isVisible,
    groupDeps,
    backgroundOrderInfo,
    fontSignal,
    orderInfo,
    handlers,
    ancestorsHaveListeners,
    textSignal,
  })
}

export function setupText(
  state: ReturnType<typeof createTextState>,
  parentCtx: ParentContext | undefined,
  abortSignal: AbortSignal,
) {
  setupRootContext(state, state.object, abortSignal)
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  createNode(state, parentCtx, state.object, false, abortSignal)

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

  const customLayouting = createInstancedText(
    state.properties,
    state.textSignal,
    state.globalMatrix,
    state.node,
    state,
    state.isVisible,
    parentCtx?.clippingRect,
    state.orderInfo,
    state.fontSignal,
    state.root.gylphGroupManager,
    undefined,
    undefined,
    undefined,
    undefined,
    abortSignal,
  )
  abortableEffect(() => state.node.value?.setCustomLayouting(customLayouting.value), abortSignal)

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
