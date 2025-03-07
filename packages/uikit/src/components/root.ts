import { Signal, computed, signal } from '@preact/signals-core'
import { ParentContext, RootContext } from '../context.js'
import { FlexNode, YogaProperties, createFlexNodeState } from '../flex/index.js'
import { LayoutListeners, ScrollListeners, setupLayoutListeners } from '../listeners.js'
import { PanelProperties, setupInstancedPanel } from '../panel/instanced-panel.js'
import {
  PanelGroupManager,
  PanelGroupProperties,
  computedPanelGroupDependencies,
} from '../panel/instanced-panel-group.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { MergedProperties, PropertyTransformers } from '../properties/merged.js'
import {
  ScrollbarProperties,
  createScrollPosition,
  setupScrollbars,
  computedScrollHandlers,
  createScrollState,
  setupScroll,
  computedGlobalScrollMatrix,
} from '../scroll.js'
import { TransformProperties, setupObjectTransform, computedTransformMatrix } from '../transform.js'
import { alignmentXMap, alignmentYMap, readReactive } from '../utils.js'
import {
  UpdateMatrixWorldProperties,
  VisibilityProperties,
  WithConditionals,
  computeDefaultProperties,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
  setupNode,
} from './utils.js'
import { computedClippingRect } from '../clipping.js'
import { ElementType, WithReversePainterSortStableCache, computedOrderInfo } from '../order.js'
import { Camera, Matrix4, Object3D, Plane, Vector2Tuple, Vector3, WebGLRenderer } from 'three'
import { GlyphGroupManager } from '../text/render/instanced-glyph-group.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { darkPropertyTransformers } from '../dark.js'
import { computedInheritableProperty } from '../properties/index.js'
import { getDefaultPanelMaterialConfig, PointerEventsProperties } from '../panel/index.js'
import { EventHandlers, ThreeEventMap } from '../events.js'

export type InheritableRootProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          TransformProperties &
          PanelProperties &
          ScrollbarProperties &
          PanelGroupProperties & {
            sizeX?: number
            sizeY?: number
            anchorX?: keyof typeof alignmentXMap
            anchorY?: keyof typeof alignmentYMap
          } & VisibilityProperties &
          UpdateMatrixWorldProperties &
          PointerEventsProperties
      >
    >
  >
>

export type RootProperties<EM extends ThreeEventMap = ThreeEventMap> = InheritableRootProperties &
  LayoutListeners &
  ScrollListeners &
  EventHandlers<EM>

export const DEFAULT_PIXEL_SIZE = 0.01

const vectorHelper = new Vector3()
const planeHelper = new Plane()

export function createRootState<EM extends ThreeEventMap = ThreeEventMap>(
  objectRef: { current?: Object3D | null },
  pixelSize: Signal<number>,
  style: Signal<RootProperties<EM> | undefined>,
  properties: Signal<RootProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  getCamera: () => Camera,
  renderer: WebGLRenderer,
  onFrameSet: Set<(delta: number) => void>,
  requestRender: () => void,
  requestFrame: () => void,
) {
  const rootSize = signal<Vector2Tuple>([0, 0])
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const interactableDescendants: Array<Object3D> = []

  const mergedProperties = computedMergedProperties(
    style,
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(rootSize),
      ...createHoverPropertyTransformers(hoveredSignal),
      ...createActivePropertyTransfomers(activeSignal),
    },
    {
      ...createSizeTranslator(pixelSize, 'sizeX', 'width'),
      ...createSizeTranslator(pixelSize, 'sizeY', 'height'),
    },
  )

  const ctx: WithReversePainterSortStableCache &
    Pick<RootContext, 'requestFrame' | 'requestRender' | 'onFrameSet' | 'pixelSize'> = {
    onFrameSet,
    requestRender,
    requestFrame,
    pixelSize,
  }

  const flexState = createFlexNodeState()
  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, pixelSize)
  const globalMatrix = computedRootMatrix(mergedProperties, transformMatrix, flexState.size, pixelSize)

  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Panel, groupDeps, undefined)

  const isVisible = computedIsVisible(flexState, undefined, mergedProperties)
  const scrollPosition = createScrollPosition()
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, pixelSize)
  const scrollbarWidth = computedInheritableProperty(mergedProperties, 'scrollbarWidth', 10)

  const updateMatrixWorld = computedInheritableProperty(mergedProperties, 'updateMatrixWorld', false)

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
    mergedProperties,
    transformMatrix,
    globalMatrix,
    groupDeps,
    orderInfo,
    isVisible,
    scrollPosition,
    childrenMatrix,
    scrollbarWidth,
    updateMatrixWorld,
    defaultProperties: computeDefaultProperties(mergedProperties),
    renderer,
    getCamera,
    rootSize,
  })

  const scrollHandlers = computedScrollHandlers(componentState, properties, objectRef)

  const handlers = computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(undefined, handlers)

  return Object.assign(componentState, {
    clippingRect: computedClippingRect(globalMatrix, componentState, ctx.pixelSize, undefined),
    handlers,
    ancestorsHaveListeners,
  }) satisfies ParentContext
}

export function setupRoot<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createRootState>,
  style: Signal<RootProperties<EM> | undefined>,
  properties: Signal<RootProperties<EM> | undefined>,
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
    state.mergedProperties,
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

  setupScroll(state, properties, state.root.pixelSize, childrenContainer, abortSignal)
  setupScrollbars(
    state.mergedProperties,
    state.scrollPosition,
    state,
    state.globalMatrix,
    state.isVisible,
    undefined,
    state.orderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    state.scrollbarWidth,
    abortSignal,
  )

  setupLayoutListeners(style, properties, state.size, abortSignal)

  setupInteractionPanel(state.interactionPanel, state.root, state.globalMatrix, state.size, abortSignal)

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
    state.updateMatrixWorld,
    false,
    state.interactionPanel,
    state.root,
    state.globalMatrix,
    true,
    abortSignal,
  )
  setupPointerEvents(
    state.mergedProperties,
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

function createSizeTranslator(pixelSize: Signal<number>, key: 'sizeX' | 'sizeY', to: string): PropertyTransformers {
  const map = new Map<unknown, Signal<number | undefined>>()
  return {
    [key]: (value: unknown, target: MergedProperties) => {
      let entry = map.get(value)
      if (entry == null) {
        map.set(
          value,
          (entry = computed(() => {
            const s = readReactive(value) as number | undefined
            if (s == null) {
              return undefined
            }
            return s / pixelSize.value
          })),
        )
      }
      target.add(to, entry)
    },
  }
}
const matrixHelper = new Matrix4()

const defaultAnchorX: keyof typeof alignmentXMap = 'center'
const defaultAnchorY: keyof typeof alignmentYMap = 'center'

function computedRootMatrix(
  propertiesSignal: Signal<MergedProperties>,
  matrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  pixelSize: Signal<number>,
) {
  const anchorX = computedInheritableProperty(propertiesSignal, 'anchorX', defaultAnchorX)
  const anchorY = computedInheritableProperty(propertiesSignal, 'anchorY', defaultAnchorY)
  return computed(() => {
    if (size.value == null) {
      return undefined
    }
    const [width, height] = size.value
    return matrix.value
      ?.clone()
      .premultiply(
        matrixHelper.makeTranslation(
          alignmentXMap[anchorX.value] * width * pixelSize.value,
          alignmentYMap[anchorY.value] * height * pixelSize.value,
          0,
        ),
      )
  })
}
