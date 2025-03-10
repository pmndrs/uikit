import { YogaProperties, createFlexNodeState } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped } from '../clipping.js'
import { ScrollbarProperties } from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties, setupInstancedPanel } from '../panel/instanced-panel.js'
import { TransformProperties, setupObjectTransform, computedTransformMatrix } from '../transform.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { computedOrderInfo, ElementType, ZIndexProperties } from '../order.js'
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
  setupPointerEvents,
  setupMatrixWorldUpdate,
} from './utils.js'
import { Listeners, setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import {
  createInteractionPanel,
  getDefaultPanelMaterialConfig,
  PointerEventsProperties,
  setupInteractionPanel,
} from '../panel/index.js'
import {
  FontFamilies,
  InstancedTextProperties,
  computedFont,
  computedGylphGroupDependencies,
  createInstancedText,
} from '../text/index.js'
import { darkPropertyTransformers } from '../dark.js'
import {
  abortableEffect,
  computedAncestorsHaveListeners,
  computedInheritableProperty,
  EventHandlers,
  ThreeEventMap,
  UpdateMatrixWorldProperties,
} from '../internals.js'
import { Object3D } from 'three'

export type InheritableTextProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          PanelProperties &
          ZIndexProperties &
          TransformProperties &
          ScrollbarProperties &
          PanelGroupProperties &
          InstancedTextProperties &
          VisibilityProperties &
          UpdateMatrixWorldProperties &
          PointerEventsProperties
      >
    >
  >
>

export type TextProperties<Em extends ThreeEventMap = ThreeEventMap> = InheritableTextProperties &
  Listeners &
  EventHandlers<Em>

export function createTextState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  textSignal: Signal<unknown | Signal<unknown> | Array<unknown | Signal<unknown>>>,
  fontFamilies: Signal<FontFamilies | undefined> | undefined,
  style: Signal<TextProperties<EM> | undefined>,
  properties: Signal<TextProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
) {
  const flexState = createFlexNodeState()
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])

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

  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const backgroundOrderInfo = computedOrderInfo(
    mergedProperties,
    'zIndexOffset',
    ElementType.Panel,
    groupDeps,
    parentCtx.orderInfo,
  )

  const fontSignal = computedFont(mergedProperties, fontFamilies, parentCtx.root.renderer)
  const orderInfo = computedOrderInfo(
    undefined,
    'zIndexOffset',
    ElementType.Text,
    computedGylphGroupDependencies(fontSignal),
    backgroundOrderInfo,
  )

  const handlers = computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)
  const updateMatrixWorld = computedInheritableProperty(mergedProperties, 'updateMatrixWorld', false)

  return Object.assign(flexState, {
    interactionPanel: createInteractionPanel(
      backgroundOrderInfo,
      parentCtx.root,
      parentCtx.clippingRect,
      globalMatrix,
      flexState,
    ),
    hoveredSignal,
    activeSignal,
    mergedProperties,
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
    updateMatrixWorld,
    textSignal,
    root: parentCtx.root,
  })
}

export function setupText<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createTextState>,
  parentCtx: ParentContext,
  style: Signal<TextProperties<EM> | undefined>,
  properties: Signal<TextProperties<EM> | undefined>,
  object: Object3D,
  abortSignal: AbortSignal,
) {
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  setupNode(state, parentCtx, object, false, abortSignal)
  setupObjectTransform(state.root, object, state.transformMatrix, abortSignal)

  setupInstancedPanel(
    state.mergedProperties,
    state.backgroundOrderInfo,
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

  const customLayouting = createInstancedText(
    state.mergedProperties,
    state.textSignal,
    state.globalMatrix,
    state.node,
    state,
    state.isVisible,
    parentCtx.clippingRect,
    state.orderInfo,
    state.fontSignal,
    state.root.gylphGroupManager,
    undefined,
    undefined,
    undefined,
    undefined,
    'break-word',
    abortSignal,
  )
  abortableEffect(() => state.node.value?.setCustomLayouting(customLayouting.value), abortSignal)

  setupInteractionPanel(state.interactionPanel, state.root, state.globalMatrix, state.size, abortSignal)

  setupPointerEvents(
    state.mergedProperties,
    state.ancestorsHaveListeners,
    state.root,
    state.interactionPanel,
    false,
    abortSignal,
  )

  setupMatrixWorldUpdate(state.updateMatrixWorld, false, object, state.root, state.globalMatrix, false, abortSignal)
  setupMatrixWorldUpdate(
    state.updateMatrixWorld,
    false,
    state.interactionPanel,
    state.root,
    state.globalMatrix,
    true,
    abortSignal,
  )

  setupLayoutListeners(style, properties, state.size, abortSignal)
  setupClippedListeners(style, properties, state.isClipped, abortSignal)
}
