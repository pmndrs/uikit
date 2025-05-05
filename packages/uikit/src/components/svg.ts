import { Signal, computed, signal } from '@preact/signals-core'
import { Box3, Group, Mesh, MeshBasicMaterial, Object3D, Plane, ShapeGeometry, Vector3 } from 'three'
import { Listeners } from '../index.js'
import { ParentContext, RootContext } from '../context.js'
import { FlexNodeState, YogaProperties, createFlexNodeState } from '../flex/index.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { PanelProperties, setupInstancedPanel } from '../panel/instanced-panel.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import {
  ScrollbarProperties,
  createScrollPosition,
  setupScrollbars,
  computedScrollHandlers,
  computedAnyAncestorScrollable,
  createScrollState,
  computedGlobalScrollMatrix,
  setupScroll,
} from '../scroll.js'
import { TransformProperties, setupObjectTransform, computedTransformMatrix } from '../transform.js'
import {
  VisibilityProperties,
  WithConditionals,
  applyAppearancePropertiesToGroup,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  setupNode,
  disposeGroup,
  keepAspectRatioPropertyTransformer,
  loadResourceWithParams,
} from './utils.js'
import { abortableEffect, ColorRepresentation, fitNormalizedContentInside, readReactive } from '../utils.js'
import { makeClippedCast, PointerEventsProperties } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, ClippingRect, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js'
import { darkPropertyTransformers } from '../dark.js'
import { PanelGroupProperties, computedPanelGroupDependencies, getDefaultPanelMaterialConfig } from '../panel/index.js'
import { KeepAspectRatioProperties } from './image.js'
import {
  computedInheritableProperty,
  computeDefaultProperties,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  EventHandlers,
  ThreeEventMap,
  computedAncestorsHaveListeners,
  computedClippingRect,
} from '../internals.js'

export type InheritableSvgProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          ZIndexProperties &
          PanelProperties &
          AppearanceProperties &
          KeepAspectRatioProperties &
          TransformProperties &
          PanelGroupProperties &
          ScrollbarProperties &
          VisibilityProperties &
          PointerEventsProperties
      >
    >
  >
>
export type AppearanceProperties = {
  opacity?: number
  color?: ColorRepresentation
}

export type SvgProperties<EM extends ThreeEventMap = ThreeEventMap> = InheritableSvgProperties &
  Listeners & {
    src?: Signal<string> | string
    keepAspectRatio?: boolean
  } & EventHandlers<EM>

export function createSvgState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  objectRef: { current?: Object3D | null },
  style: Signal<SvgProperties<EM> | undefined>,
  properties: Signal<SvgProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
) {
  const flexState = createFlexNodeState()
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const aspectRatio = signal<number | undefined>(undefined)
  const svgObject = signal<Object3D | undefined>(undefined)

  const mergedProperties = computedMergedProperties(
    style,
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(parentCtx.root.size),
      ...createHoverPropertyTransformers(hoveredSignal),
      ...createActivePropertyTransfomers(activeSignal),
    },
    keepAspectRatioPropertyTransformer,
    (m) => m.add('aspectRatio', aspectRatio),
  )

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

  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Svg, undefined, backgroundOrderInfo)
  const src = computed(() => readReactive(style.value?.src) ?? readReactive(properties.value?.src))

  const scrollPosition = createScrollPosition()
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentCtx.root.pixelSize)

  const scrollbarWidth = computedInheritableProperty(mergedProperties, 'scrollbarWidth', 10)

  const updateMatrixWorld = computedInheritableProperty(mergedProperties, 'updateMatrixWorld', false)

  const componentState = Object.assign(flexState, {
    centerGroup: createCenterGroup(),
    interactionPanel: createInteractionPanel(
      orderInfo,
      parentCtx.root,
      parentCtx.clippingRect,
      globalMatrix,
      flexState,
    ),
    scrollState: createScrollState(),
    hoveredSignal,
    activeSignal,
    aspectRatio,
    svgObject,
    mergedProperties,
    transformMatrix,
    globalMatrix,
    isClipped,
    isVisible,
    groupDeps,
    backgroundOrderInfo,
    orderInfo,
    src,
    scrollPosition,
    scrollbarWidth,
    childrenMatrix,
    updateMatrixWorld,
    clippingRect: computedClippingRect(globalMatrix, flexState, parentCtx.root.pixelSize, parentCtx.clippingRect),
    defaultProperties: computeDefaultProperties(mergedProperties),
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx.anyAncestorScrollable),
    root: parentCtx.root,
  })

  const scrollHandlers = computedScrollHandlers(componentState, properties, objectRef)

  const handlers = computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  return Object.assign(componentState, {
    handlers,
    ancestorsHaveListeners,
  }) satisfies ParentContext
}

export function setupSvg<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createSvgState>,
  parentCtx: ParentContext,
  style: Signal<SvgProperties<EM> | undefined>,
  properties: Signal<SvgProperties<EM> | undefined>,
  object: Object3D,
  childrenContainer: Object3D,
  abortSignal: AbortSignal,
) {
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  setupNode(state, parentCtx, object, true, abortSignal)
  setupObjectTransform(parentCtx.root, object, state.transformMatrix, abortSignal)

  setupInstancedPanel(
    state.mergedProperties,
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

  const clippingPlanes = createGlobalClippingPlanes(parentCtx.root, parentCtx.clippingRect)

  loadResourceWithParams(
    state.svgObject,
    loadSvg,
    disposeGroup,
    abortSignal,
    state.src,
    parentCtx.root,
    clippingPlanes,
    parentCtx.clippingRect,
    state.orderInfo,
    state.aspectRatio,
    state,
  )

  applyAppearancePropertiesToGroup(state.mergedProperties, state.svgObject, abortSignal)
  setupCenterGroup(
    state.centerGroup,
    parentCtx.root,
    state,
    state.svgObject,
    state.aspectRatio,
    state.isVisible,
    abortSignal,
  )

  setupScroll(state, properties, parentCtx.root.pixelSize, childrenContainer, abortSignal)
  setupScrollbars(
    state.mergedProperties,
    state.scrollPosition,
    state,
    state.globalMatrix,
    state.isVisible,
    parentCtx.clippingRect,
    state.orderInfo,
    state.groupDeps,
    parentCtx.root.panelGroupManager,
    state.scrollbarWidth,
    abortSignal,
  )

  setupInteractionPanel(state.interactionPanel, state.root, state.globalMatrix, state.size, abortSignal)

  setupMatrixWorldUpdate(
    state.updateMatrixWorld,
    true,
    state.interactionPanel,
    parentCtx.root,
    state.globalMatrix,
    true,
    abortSignal,
  )
  setupMatrixWorldUpdate(true, true, state.centerGroup, parentCtx.root, state.globalMatrix, true, abortSignal)

  setupPointerEvents(
    state.mergedProperties,
    state.ancestorsHaveListeners,
    parentCtx.root,
    state.centerGroup,
    false,
    abortSignal,
  )
  setupPointerEvents(
    state.mergedProperties,
    state.ancestorsHaveListeners,
    parentCtx.root,
    state.interactionPanel,
    false,
    abortSignal,
  )

  setupLayoutListeners(style, properties, state.size, abortSignal)
  setupClippedListeners(style, properties, state.isClipped, abortSignal)
}

function createCenterGroup(): Group {
  const centerGroup = new Group()
  centerGroup.matrixAutoUpdate = false
  return centerGroup
}

function setupCenterGroup(
  centerGroup: Group,
  root: RootContext,
  flexState: FlexNodeState,
  svgObject: Signal<Object3D | undefined>,
  aspectRatio: Signal<number | undefined>,
  isVisible: Signal<boolean>,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    fitNormalizedContentInside(
      centerGroup.position,
      centerGroup.scale,
      flexState.size,
      flexState.paddingInset,
      flexState.borderInset,
      root.pixelSize.value,
      aspectRatio.value ?? 1,
    )
    centerGroup.updateMatrix()
    root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    const object = svgObject.value
    if (object == null) {
      return
    }
    centerGroup.add(object)
    root.requestRender()
    return () => {
      centerGroup.remove(object)
      root.requestRender()
    }
  }, abortSignal)
  abortableEffect(() => {
    void (centerGroup.visible = svgObject.value != null && isVisible.value)
    root.requestRender()
  }, abortSignal)
}

const loader = new SVGLoader()

const box3Helper = new Box3()
const vectorHelper = new Vector3()

const svgCache = new Map<string, SVGResult>()

async function loadSvg(
  url: string | undefined,
  root: RootContext,
  clippingPlanes: Array<Plane>,
  clippedRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo | undefined>,
  aspectRatio: Signal<number | undefined>,
  flexState: FlexNodeState,
) {
  if (url == null) {
    return undefined
  }
  const object = new Group()
  object.matrixAutoUpdate = false
  let result = svgCache.get(url)
  if (result == null) {
    svgCache.set(url, (result = await loader.loadAsync(url)))
  }
  box3Helper.makeEmpty()
  for (const path of result.paths) {
    const shapes = SVGLoader.createShapes(path)
    const material = new MeshBasicMaterial()
    material.transparent = true
    material.depthWrite = false
    material.toneMapped = false
    material.clippingPlanes = clippingPlanes

    for (const shape of shapes) {
      const geometry = new ShapeGeometry(shape)
      geometry.computeBoundingBox()
      box3Helper.union(geometry.boundingBox!)
      const mesh = new Mesh(geometry, material)
      mesh.matrixAutoUpdate = false
      mesh.raycast = makeClippedCast(mesh, mesh.raycast, root.objectRef, clippedRect, orderInfo, flexState)
      setupRenderOrder(mesh, root, orderInfo)
      mesh.userData.color = path.color
      mesh.scale.y = -1
      mesh.updateMatrix()
      object.add(mesh)
    }
  }
  box3Helper.getSize(vectorHelper)
  aspectRatio.value = vectorHelper.x / vectorHelper.y
  const scale = 1 / vectorHelper.y
  object.scale.set(1, 1, 1).multiplyScalar(scale)
  box3Helper.getCenter(vectorHelper)
  vectorHelper.y *= -1
  object.position.copy(vectorHelper).negate().multiplyScalar(scale)
  object.updateMatrix()

  return object
}
