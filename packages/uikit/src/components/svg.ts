import { Box3 } from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"


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
  object: Component,
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = setupRootContext(parentCtx, object, flexState.size, renderContext)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const aspectRatio = signal<number | undefined>(undefined)

  const properties: Properties<EM, AdditionalSvgProperties, Partial<AdditionalSvgDefaults>> = new Properties<
    EM,
    AdditionalSvgProperties,
    Partial<AdditionalSvgDefaults>
  >(allAliases, createConditionals(rootContext.root.size, hoveredSignal, activeSignal), parentCtx?.properties, {
    ...additionalSvgDefaults,
    aspectRatio: computed(() => (properties.get('keepAspectRatio') ? aspectRatio.value : undefined)),
  })

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

  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Svg, undefined, backgroundOrderInfo)

  const scrollPosition = createScrollPosition()
  const childrenMatrix = computedGlobalScrollMatrix(properties, scrollPosition, globalMatrix)

  buildRaycasting(object, rootContext.root, globalMatrix, parentCtx?.clippingRect, orderInfo, flexState)

  const componentState = Object.assign(flexState, rootContext, {
    panelMatrix: computedPanelMatrix(properties, globalMatrix, flexState.size, undefined),
    scrollState: createScrollState(),
    hoveredSignal,
    activeSignal,
    aspectRatio,
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
      parentCtx?.clippingRect,
    ),
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx?.anyAncestorScrollable),
  })

  const scrollHandlers = computedScrollHandlers(componentState, object)

  const handlers = computedHandlers(properties, hoveredSignal, activeSignal, scrollHandlers)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  return Object.assign(componentState, {
    object,
    handlers,
    ancestorsHaveListeners,
    fontFamilies: computedFontFamilies(properties, parentCtx),
  }) satisfies ParentContext
}

export function setupSvg(
  state: ReturnType<typeof createSvgState>,
  parentCtx: ParentContext | undefined,
  abortSignal: AbortSignal,
) {
  setupRootContext(state, state.object, abortSignal)
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  createNode(state, parentCtx, state.object, true, abortSignal)

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

  const clippingPlanes = createGlobalClippingPlanes(state.root, parentCtx?.clippingRect)

  const svgResult = signal<{ meshes: Array<Mesh>; center: Vector3; size: Vector3 } | undefined>(undefined)
  loadResourceWithParams(
    svgResult,
    loadSvg,
    disposeSvg,
    abortSignal,
    state.properties.getSignal('src'),
    state.root,
    clippingPlanes,
    parentCtx?.clippingRect,
    state.orderInfo,
    state,
  )

  applyAppearancePropertiesToGroup(state.properties, state.object, abortSignal)
  setupSvgMesges(
    svgResult,
    state.properties,
    state.object,
    state.root,
    state,
    state.aspectRatio,
    state.isVisible,
    abortSignal,
  )

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

  setupMatrixWorldUpdate(
    true,
    true,
    state.properties,
    state.size,
    state.object,
    state.root,
    state.globalMatrix,
    abortSignal,
  )

  setupPointerEvents(state.properties, state.ancestorsHaveListeners, state.root, state.object, false, abortSignal)

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)
}

function setupSvgMesges(
  svgResultSignal: Signal<{ meshes: Array<Mesh> } | undefined>,
  properties: Properties,
  object: Object3D,
  root: RootContext,
  flexState: FlexNodeState,
  aspectRatio: Signal<number | undefined>,
  isVisible: Signal<boolean>,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    //TODO: integrate this into the object transformation computation
    fitNormalizedContentInside(
      object.position,
      object.scale,
      flexState.size,
      flexState.paddingInset,
      flexState.borderInset,
      properties.get('pixelSize'),
      aspectRatio.value ?? 1,
    )
    object.updateMatrix()
    root.requestRender?.()
  }, abortSignal)
  abortableEffect(() => {
    const svgResult = svgResultSignal.value
    if (svgResult == null) {
      return
    }
    svgResult.meshes.forEach((mesh) => object.add(mesh))
    root.requestRender?.()
    return () => {
      svgResult.meshes.forEach((mesh) => object.remove(mesh))
      root.requestRender?.()
    }
  }, abortSignal)
  abortableEffect(() => {
    void (object.visible = svgResultSignal.value != null && isVisible.value)
    root.requestRender?.()
  }, abortSignal)
}

const loader = new SVGLoader()

const box3Helper = new Box3()

const svgCache = new Map<string, SVGResult>()

async function loadSvg(
  url: string | undefined,
  root: RootContext,
  clippingPlanes: Array<Plane> | null,
  clippedRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo | undefined>,
  flexState: FlexNodeState,
): Promise<{ meshes: Array<Mesh>; size: Vector3; center: Vector3 } | undefined> {
  if (url == null) {
    return undefined
  }
  let result = svgCache.get(url)
  if (result == null) {
    svgCache.set(url, (result = await loader.loadAsync(url)))
  }
  box3Helper.makeEmpty()
  const meshes: Array<Mesh> = []
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
      mesh.raycast = makeClippedCast(mesh, mesh.raycast, root.component, clippedRect, orderInfo, flexState)
      setupRenderOrder(mesh, root, orderInfo)
      mesh.userData.color = path.color
      mesh.scale.y = -1
      mesh.updateMatrix()
      meshes.push(mesh)
    }
  }
  //TODO: integrate this into the object transformation computation
  const size = new Vector3()
  box3Helper.getSize(size)
  //aspectRatio.value = vectorHelper.x / vectorHelper.y
  //const scale = 1 / vectorHelper.y
  //object.scale.set(1, 1, 1).multiplyScalar(scale)
  const center = new Vector3()
  box3Helper.getCenter(center)
  //vectorHelper.y *= -1
  //object.position.copy(vectorHelper).negate().multiplyScalar(scale)
  return {
    meshes,
    center,
    size,
  }
}

function disposeSvg(value?: { meshes: Array<Mesh>; size: Vector3; center: Vector3 }) {}
