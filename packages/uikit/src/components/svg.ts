import { Signal, computed, signal } from '@preact/signals-core'
import { Box3, Group, Mesh, MeshBasicMaterial, Object3D, Plane, ShapeGeometry, Vector3 } from 'three'
import { ParentContext, RootContext } from '../context.js'
import { FlexNodeState, createFlexNodeState } from '../flex/index.js'
import { ElementType, OrderInfo, computedOrderInfo, setupRenderOrder } from '../order.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import {
  createScrollPosition,
  setupScrollbars,
  computedScrollHandlers,
  computedAnyAncestorScrollable,
  createScrollState,
  computedGlobalScrollMatrix,
  setupScroll,
} from '../scroll.js'
import { setupObjectTransform, computedTransformMatrix } from '../transform.js'
import {
  applyAppearancePropertiesToGroup,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  setupNode,
  disposeGroup,
  loadResourceWithParams,
  computedAncestorsHaveListeners,
  setupMatrixWorldUpdate,
  setupPointerEvents,
} from './utils.js'
import { abortableEffect, fitNormalizedContentInside } from '../utils.js'
import { makeClippedCast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, ClippingRect, createGlobalClippingPlanes, computedClippingRect } from '../clipping.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { setupCursorCleanup } from '../hover.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js'
import { computedPanelGroupDependencies, getDefaultPanelMaterialConfig } from '../panel/index.js'
import { ThreeEventMap } from '../events.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { computedFontFamilies } from '../text/font.js'

export type SvgProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, AdditionalSvgProperties>

export type AdditionalSvgProperties = {
  keepAspectRatio?: boolean
  src?: string
}

const additionalSvgDefaults = {
  keepAspectRatio: true,
} as const

export type AdditionalSvgDefaults = typeof additionalSvgDefaults & { aspectRatio: Signal<number | undefined> }

export function createSvgState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  objectRef: { current?: Object3D | null },
) {
  const flexState = createFlexNodeState()
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const aspectRatio = signal<number | undefined>(undefined)
  const svgObject = signal<Object3D | undefined>(undefined)

  const properties: Properties<EM, AdditionalSvgProperties, Partial<AdditionalSvgDefaults>> = new Properties<
    EM,
    AdditionalSvgProperties,
    Partial<AdditionalSvgDefaults>
  >(allAliases, createConditionals(parentCtx.root.size, hoveredSignal, activeSignal), parentCtx.properties, {
    ...additionalSvgDefaults,
    aspectRatio: computed(() => (properties.get('keepAspectRatio') ? aspectRatio.value : undefined)),
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

  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Svg, undefined, backgroundOrderInfo)

  const scrollPosition = createScrollPosition()
  const childrenMatrix = computedGlobalScrollMatrix(properties, scrollPosition, globalMatrix)

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
    properties,
    transformMatrix,
    globalMatrix,
    isClipped,
    isVisible,
    groupDeps,
    backgroundOrderInfo,
    orderInfo,
    scrollPosition,
    childrenMatrix,
    clippingRect: computedClippingRect(
      globalMatrix,
      flexState,
      properties.getSignal('pixelSize'),
      parentCtx.clippingRect,
    ),
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx.anyAncestorScrollable),
    root: parentCtx.root,
  })

  const scrollHandlers = computedScrollHandlers(componentState, objectRef)

  const handlers = computedHandlers(properties, hoveredSignal, activeSignal, scrollHandlers)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  return Object.assign(componentState, {
    handlers,
    ancestorsHaveListeners,
    fontFamilies: computedFontFamilies(properties, parentCtx),
  }) satisfies ParentContext
}

export function setupSvg<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createSvgState>,
  parentCtx: ParentContext,
  object: Object3D,
  childrenContainer: Object3D,
  abortSignal: AbortSignal,
) {
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  setupNode(state, parentCtx, object, true, abortSignal)
  setupObjectTransform(parentCtx.root, object, state.transformMatrix, abortSignal)

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

  const clippingPlanes = createGlobalClippingPlanes(parentCtx.root, parentCtx.clippingRect)

  loadResourceWithParams(
    state.svgObject,
    loadSvg,
    disposeGroup,
    abortSignal,
    state.properties.getSignal('src'),
    parentCtx.root,
    clippingPlanes,
    parentCtx.clippingRect,
    state.orderInfo,
    state.aspectRatio,
    state,
  )

  applyAppearancePropertiesToGroup(state.properties, state.svgObject, abortSignal)
  setupCenterGroup(
    state.properties,
    state.centerGroup,
    parentCtx.root,
    state,
    state.svgObject,
    state.aspectRatio,
    state.isVisible,
    abortSignal,
  )

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
    parentCtx.root.panelGroupManager,
    abortSignal,
  )

  setupInteractionPanel(state.properties, state.interactionPanel, state.globalMatrix, state.size, abortSignal)

  setupMatrixWorldUpdate(
    state.properties.getSignal('updateMatrixWorld'),
    true,
    state.interactionPanel,
    parentCtx.root,
    state.globalMatrix,
    true,
    abortSignal,
  )
  setupMatrixWorldUpdate(true, true, state.centerGroup, parentCtx.root, state.globalMatrix, true, abortSignal)

  setupPointerEvents(
    state.properties,
    state.ancestorsHaveListeners,
    parentCtx.root,
    state.centerGroup,
    false,
    abortSignal,
  )
  setupPointerEvents(
    state.properties,
    state.ancestorsHaveListeners,
    parentCtx.root,
    state.interactionPanel,
    false,
    abortSignal,
  )

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)
}

function createCenterGroup(): Group {
  const centerGroup = new Group()
  centerGroup.matrixAutoUpdate = false
  return centerGroup
}

function setupCenterGroup(
  properties: Properties,
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
      properties.get('pixelSize'),
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
