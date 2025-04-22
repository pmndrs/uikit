import { createFlexNodeState } from '../flex/node.js'
import { setupCursorCleanup } from '../hover.js'
import { computedIsClipped } from '../clipping.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { setupObjectTransform, computedTransformMatrix } from '../transform.js'
import { computedOrderInfo, ElementType } from '../order.js'
import { Signal, signal } from '@preact/signals-core'
import {
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  setupNode,
  setupPointerEvents,
  setupMatrixWorldUpdate,
  computedAncestorsHaveListeners,
} from './utils.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext } from '../context.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel, getDefaultPanelMaterialConfig, setupInteractionPanel } from '../panel/index.js'
import {
  AdditionalTextDefaults,
  AdditionalTextProperties,
  FontFamilies,
  additionalTextDefaults,
  computedFont,
  computedFontFamilies,
  computedGylphGroupDependencies,
  createInstancedText,
} from '../text/index.js'
import { Object3D } from 'three'
import { ThreeEventMap } from '../events.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { abortableEffect } from '../utils.js'
import { computedRootMatrix, createRootContext, RenderContext, setupRootContext } from './root.js'

export type TextProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, {}>

export function createTextState<EM extends ThreeEventMap = ThreeEventMap>(
  objectRef: { current?: Object3D | null },
  textSignal: Signal<unknown | Signal<unknown> | Array<unknown | Signal<unknown>>>,
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = createRootContext(parentCtx, objectRef, flexState.size, renderContext)
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

  return Object.assign(flexState, rootContext, {
    interactionPanel: createInteractionPanel(
      backgroundOrderInfo,
      rootContext.root,
      parentCtx?.clippingRect,
      globalMatrix,
      flexState,
    ),
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
  object: Object3D,
  abortSignal: AbortSignal,
) {
  setupRootContext(state, object, undefined, abortSignal)
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  setupNode(state, parentCtx, object, false, abortSignal)
  setupObjectTransform(state.root, object, state.transformMatrix, abortSignal)

  setupInstancedPanel(
    state.properties,
    state.backgroundOrderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    state.globalMatrix,
    state.size,
    undefined,
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
