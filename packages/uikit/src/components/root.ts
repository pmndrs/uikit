import { Signal, computed, signal } from '@preact/signals-core'
import { Object3DRef, ParentContext, RootContext } from '../context.js'
import { FlexNode, YogaProperties, createFlexNodeState } from '../flex/index.js'
import { LayoutListeners, ScrollListeners, setupLayoutListeners } from '../listeners.js'
import { PanelProperties, createInstancedPanel } from '../panel/instanced-panel.js'
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
  applyScrollPosition,
  computedGlobalScrollMatrix,
  createScrollPosition,
  createScrollbars,
  computedScrollHandlers,
} from '../scroll.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import { Initializers, alignmentXMap, alignmentYMap, readReactive } from '../utils.js'
import {
  UpdateMatrixWorldProperties,
  VisibilityProperties,
  WithConditionals,
  computeAnyAncestorsHaveListeners,
  computeDefaultProperties,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  setupMatrixWorldUpdate,
  setupPointerEvents,
} from './utils.js'
import { computedClippingRect } from '../clipping.js'
import { computedOrderInfo, ElementType, WithCameraDistance } from '../order.js'
import { Camera, Matrix4, Object3D, Plane, Vector2Tuple, Vector3, WebGLRenderer } from 'three'
import { GlyphGroupManager } from '../text/render/instanced-glyph-group.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { darkPropertyTransformers } from '../dark.js'
import { computedInheritableProperty } from '../properties/index.js'
import { getDefaultPanelMaterialConfig, PointerEventsProperties } from '../panel/index.js'

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

export type RootProperties = InheritableRootProperties & LayoutListeners & ScrollListeners

export const DEFAULT_PIXEL_SIZE = 0.01

const vectorHelper = new Vector3()
const planeHelper = new Plane()

const identityMatrix = signal(new Matrix4())

export function createRoot(
  pixelSize: Signal<number>,
  style: Signal<RootProperties | undefined>,
  properties: Signal<RootProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
  getCamera: () => Camera,
  renderer: WebGLRenderer,
  onFrameSet: Set<(delta: number) => void>,
  requestRender: () => void = () => {},
  requestFrame: () => void = () => {},
) {
  const rootSize = signal<Vector2Tuple>([0, 0])
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const interactableDescendants: Array<Object3D> = []
  const initializers: Initializers = [
    () => {
      if (object.current != null) {
        object.current.interactableDescendants = interactableDescendants
      }
      return () => {}
    },
  ]
  setupCursorCleanup(hoveredSignal, initializers)
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

  const ctx: WithCameraDistance & Pick<RootContext, 'requestFrame' | 'requestRender' | 'onFrameSet' | 'pixelSize'> = {
    cameraDistance: 0,
    onFrameSet,
    requestRender,
    requestFrame,
    pixelSize,
  }

  const node = signal<FlexNode | undefined>(undefined)
  const requestCalculateLayout = createDeferredRequestLayoutCalculation(ctx, node, initializers)
  const flexState = createFlexNodeState()
  initializers.push((subscriptions) => {
    const newNode = new FlexNode(flexState, mergedProperties, requestCalculateLayout, object, true, subscriptions)
    node.value = newNode
    return subscriptions
  })

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, pixelSize)
  const globalMatrix = computedRootMatrix(mergedProperties, transformMatrix, flexState.size, pixelSize)

  //rootMatrix is automatically applied to everything, even the instanced things because everything is part of object
  applyTransform(ctx, object, globalMatrix, initializers)
  const groupDeps = computedPanelGroupDependencies(mergedProperties)

  const orderInfo = computedOrderInfo(undefined, ElementType.Panel, groupDeps, undefined)

  const panelGroupManager = new PanelGroupManager(pixelSize, ctx, object, initializers)

  const onCameraDistanceFrame = () => {
    if (object.current == null) {
      ctx.cameraDistance = 0
      return
    }
    planeHelper.normal.set(0, 0, 1)
    planeHelper.constant = 0
    planeHelper.applyMatrix4(object.current.matrixWorld)
    vectorHelper.setFromMatrixPosition(getCamera().matrixWorld)
    ctx.cameraDistance = planeHelper.distanceToPoint(vectorHelper)
  }
  initializers.push(() => {
    onFrameSet.add(onCameraDistanceFrame)
    return () => onFrameSet.delete(onCameraDistanceFrame)
  })

  const isVisible = computedIsVisible(flexState, undefined, mergedProperties)

  initializers.push((subscriptions) =>
    createInstancedPanel(
      mergedProperties,
      orderInfo,
      groupDeps,
      panelGroupManager,
      identityMatrix,
      flexState.size,
      undefined,
      flexState.borderInset,
      undefined,
      isVisible,
      getDefaultPanelMaterialConfig(),
      subscriptions,
    ),
  )

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, pixelSize, initializers)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, identityMatrix, pixelSize)
  const scrollbarWidth = computedInheritableProperty(mergedProperties, 'scrollbarWidth', 10)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    flexState,
    identityMatrix,
    isVisible,
    undefined,
    orderInfo,
    panelGroupManager,
    scrollbarWidth,
    initializers,
  )

  setupLayoutListeners(style, properties, flexState.size, initializers)

  const gylphGroupManager = new GlyphGroupManager(pixelSize, ctx, object, initializers)

  const rootCtx: RootContext = Object.assign(ctx, {
    objectInvertedWorldMatrix: new Matrix4(),
    rayInGlobalSpaceMap: new Map(),
    interactableDescendants,
    onUpdateMatrixWorldSet: new Set<() => void>(),
    requestFrame,
    scrollPosition,
    requestCalculateLayout,
    cameraDistance: 0,
    gylphGroupManager,
    object,
    panelGroupManager,
    pixelSize,
    renderer,
    size: flexState.size,
  })

  const interactionPanel = createInteractionPanel(
    orderInfo,
    rootCtx,
    undefined,
    flexState.size,
    globalMatrix,
    initializers,
  )

  //setup matrix world updates
  initializers.push(() => {
    if (childrenContainer.current != null) {
      childrenContainer.current.updateMatrixWorld = function () {
        if (this.parent == null) {
          this.matrixWorld.copy(this.matrix)
        } else {
          this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)
        }
        for (const update of rootCtx.onUpdateMatrixWorldSet) {
          update()
        }
      }
    }
    return () => {}
  })

  const updateMatrixWorld = computedInheritableProperty(mergedProperties, 'updateMatrixWorld', false)
  setupMatrixWorldUpdate(updateMatrixWorld, false, interactionPanel, rootCtx, globalMatrix, initializers, true)

  const scrollHandlers = computedScrollHandlers(
    scrollPosition,
    undefined,
    flexState,
    object,
    scrollbarWidth,
    properties,
    ctx,
    initializers,
  )

  const handlers = computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers)
  const ancestorsHaveListeners = computeAnyAncestorsHaveListeners(undefined, handlers)
  setupPointerEvents(mergedProperties, ancestorsHaveListeners, rootCtx, interactionPanel, initializers, false)

  return Object.assign(flexState, {
    ancestorsHaveListeners,
    defaultProperties: computeDefaultProperties(mergedProperties),
    globalMatrix,
    isVisible,
    scrollPosition,
    mergedProperties,
    anyAncestorScrollable: flexState.scrollable,
    clippingRect: computedClippingRect(identityMatrix, flexState, pixelSize, undefined),
    childrenMatrix,
    node,
    orderInfo,
    initializers,
    interactionPanel,
    handlers,
    root: rootCtx,
  }) satisfies ParentContext
}

function createDeferredRequestLayoutCalculation(
  root: Pick<RootContext, 'requestRender' | 'onFrameSet'>,
  nodeSignal: Signal<FlexNode | undefined>,
  initializers: Initializers,
) {
  let requested: boolean = false
  const onFrame = () => {
    const node = nodeSignal.peek()
    if (!requested || node == null) {
      return
    }
    requested = false
    node.calculateLayout()
  }
  initializers.push(() => {
    root.onFrameSet.add(onFrame)
    return () => root.onFrameSet.delete(onFrame)
  })
  return () => {
    requested = true
    root.requestRender()
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
