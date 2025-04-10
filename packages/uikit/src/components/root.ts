import { Signal, computed, signal } from '@preact/signals-core'
import { ParentContext, RootContext } from '../context.js'
import { FlexNode, createFlexNodeState } from '../flex/index.js'
import { setupLayoutListeners } from '../listeners.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { PanelGroupManager, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import {
  createScrollPosition,
  setupScrollbars,
  computedScrollHandlers,
  createScrollState,
  setupScroll,
  computedGlobalScrollMatrix,
} from '../scroll.js'
import { setupObjectTransform, computedTransformMatrix } from '../transform.js'
import { alignmentXMap, alignmentYMap, readReactive } from '../utils.js'
import {
  computedHandlers,
  computedIsVisible,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
  setupNode,
} from './utils.js'
import { computedClippingRect } from '../clipping.js'
import { ElementType, WithReversePainterSortStableCache, computedOrderInfo } from '../order.js'
import { Camera, Matrix4, Object3D, Plane, Vector2Tuple, Vector3, WebGLRenderer } from 'three'
import { GlyphGroupManager } from '../text/render/instanced-glyph-group.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { getDefaultPanelMaterialConfig } from '../panel/index.js'
import { ThreeEventMap } from '../events.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { setupCursorCleanup } from '../hover.js'
import { computedFontFamilies } from '../text/font.js'

export type RootProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, {}>

export function createRootState<EM extends ThreeEventMap = ThreeEventMap>(
  objectRef: { current?: Object3D | null },
  getCamera: () => Camera,
  renderer: WebGLRenderer,
  onFrameSet: Set<(delta: number) => void>,
  requestRender: () => void,
  requestFrame: () => void,
) {
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const interactableDescendants: Array<Object3D> = []

  const flexState = createFlexNodeState()

  const properties = new Properties<EM, {}, {}>(
    allAliases,
    createConditionals(flexState.size, hoveredSignal, activeSignal),
    undefined,
    {},
  )

  const ctx: WithReversePainterSortStableCache & Pick<RootContext, 'requestFrame' | 'requestRender' | 'onFrameSet'> = {
    onFrameSet,
    requestRender,
    requestFrame,
  }

  const transformMatrix = computedTransformMatrix(properties, flexState)
  const globalMatrix = computedRootMatrix(properties, transformMatrix, flexState.size)

  const groupDeps = computedPanelGroupDependencies(properties)
  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Panel, groupDeps, undefined)

  const isVisible = computedIsVisible(flexState, undefined, properties)
  const scrollPosition = createScrollPosition()
  const childrenMatrix = computedGlobalScrollMatrix(properties, scrollPosition, globalMatrix)

  const root = Object.assign(ctx, {
    objectInvertedWorldMatrix: new Matrix4(),
    rayInGlobalSpaceMap: new Map(),
    interactableDescendants,
    onUpdateMatrixWorldSet: new Set<() => void>(),
    requestCalculateLayout: () => {},
    objectRef,
    gylphGroupManager: new GlyphGroupManager(ctx, objectRef),
    panelGroupManager: new PanelGroupManager(ctx, objectRef),
    renderer,
    size: flexState.size,
  }) satisfies RootContext

  const componentState = Object.assign(flexState, {
    interactionPanel: createInteractionPanel(orderInfo, root, undefined, globalMatrix, flexState),
    root,
    scrollState: createScrollState(),
    anyAncestorScrollable: signal<[boolean, boolean]>([false, false]),
    hoveredSignal,
    activeSignal,
    properties,
    transformMatrix,
    globalMatrix,
    groupDeps,
    orderInfo,
    isVisible,
    scrollPosition,
    childrenMatrix,
    renderer,
    getCamera,
  })

  const scrollHandlers = computedScrollHandlers(componentState, objectRef)

  const handlers = computedHandlers(properties, hoveredSignal, activeSignal, scrollHandlers)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(undefined, handlers)

  return Object.assign(componentState, {
    properties,
    clippingRect: computedClippingRect(globalMatrix, componentState, properties.getSignal('pixelSize'), undefined),
    handlers,
    ancestorsHaveListeners,
    fontFamilies: computedFontFamilies(properties, undefined),
  }) satisfies ParentContext
}

export function setupRoot<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createRootState>,
  object: Object3D,
  childrenContainer: Object3D,
  abortSignal: AbortSignal,
) {
  state.root.gylphGroupManager.init(abortSignal)
  state.root.panelGroupManager.init(abortSignal)

  object.interactableDescendants = state.root.interactableDescendants
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  const node = setupNode(state, undefined, object, true, abortSignal)
  state.root.requestCalculateLayout = createDeferredRequestLayoutCalculation(state.root, node, abortSignal)

  setupObjectTransform(state.root, object, state.globalMatrix, abortSignal)

  const onFrame = () => void (state.root.reversePainterSortStableCache = undefined)

  state.root.onFrameSet.add(onFrame)
  abortSignal.addEventListener('abort', () => state.root.onFrameSet.delete(onFrame))

  setupInstancedPanel(
    state.properties,
    state.orderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    state.globalMatrix,
    state.size,
    undefined,
    state.borderInset,
    undefined,
    state.isVisible,
    getDefaultPanelMaterialConfig(),
    abortSignal,
  )

  setupScroll(state, childrenContainer, abortSignal)
  setupScrollbars(
    state.properties,
    state.scrollPosition,
    state,
    state.globalMatrix,
    state.isVisible,
    undefined,
    state.orderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    abortSignal,
  )

  setupLayoutListeners(state.properties, state.size, abortSignal)

  setupInteractionPanel(state.properties, state.interactionPanel, state.globalMatrix, state.size, abortSignal)

  childrenContainer.updateMatrixWorld = function () {
    if (this.parent == null) {
      this.matrixWorld.copy(this.matrix)
    } else {
      this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)
    }
    for (const update of state.root.onUpdateMatrixWorldSet) {
      update()
    }
  }

  setupMatrixWorldUpdate(
    state.properties.getSignal('updateMatrixWorld'),
    false,
    state.interactionPanel,
    state.root,
    state.globalMatrix,
    true,
    abortSignal,
  )
  setupPointerEvents(
    state.properties,
    state.ancestorsHaveListeners,
    state.root,
    state.interactionPanel,
    false,
    abortSignal,
  )
}

function createDeferredRequestLayoutCalculation(
  root: Pick<RootContext, 'requestFrame' | 'onFrameSet'>,
  node: FlexNode,
  abortSignal: AbortSignal,
) {
  let requested: boolean = true
  const onFrame = () => {
    if (!requested) {
      return
    }
    requested = false
    node.calculateLayout()
  }
  root.onFrameSet.add(onFrame)
  abortSignal.addEventListener('abort', () => root.onFrameSet.delete(onFrame))
  return () => {
    requested = true
    root.requestFrame()
  }
}

const matrixHelper = new Matrix4()

function computedRootMatrix(
  properties: Properties,
  matrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
) {
  return computed(() => {
    if (size.value == null) {
      return undefined
    }
    const [width, height] = size.value
    const pixelSize = properties.get('pixelSize')
    return matrix.value
      ?.clone()
      .premultiply(
        matrixHelper.makeTranslation(
          alignmentXMap[properties.get('anchorX')] * width * pixelSize,
          alignmentYMap[properties.get('anchorY')] * height * pixelSize,
          0,
        ),
      )
  })
}
