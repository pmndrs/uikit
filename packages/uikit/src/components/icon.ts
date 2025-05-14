import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js"


export type IconProperties<EM extends ThreeEventMap> = AllProperties<EM, {}>

export function createIconState<EM extends ThreeEventMap = ThreeEventMap>(
  text: string,
  svgWidth: number,
  svgHeight: number,
  object: Component,
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = setupRootContext(parentCtx, object, flexState.size, renderContext)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])

  const properties = new Properties<EM>(
    allAliases,
    createConditionals(rootContext.root.size, hoveredSignal, activeSignal),
    parentCtx?.properties,
    {
      aspectRatio: svgWidth / svgHeight,
      width: svgWidth,
      height: svgHeight,
    },
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

  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Svg, undefined, backgroundOrderInfo)

  const handlers = computedHandlers(properties, hoveredSignal, activeSignal)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  const clippingPlanes = createGlobalClippingPlanes(rootContext.root, parentCtx?.clippingRect)

  buildRaycasting(object, rootContext.root, globalMatrix, parentCtx?.clippingRect, orderInfo, flexState)

  return Object.assign(flexState, rootContext, {
    panelMatrix: computedPanelMatrix(properties, globalMatrix, flexState.size, undefined),
    clippingPlanes,
    object,
    hoveredSignal,
    activeSignal,
    properties: properties,
    transformMatrix,
    globalMatrix,
    isClipped,
    isVisible,
    groupDeps,
    backgroundOrderInfo,
    orderInfo,
    handlers,
    ancestorsHaveListeners,
    text,
    svgWidth,
    svgHeight,
  })
}

export function setupIcon(
  state: ReturnType<typeof createIconState>,
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

  setupIconGroup(
    state.object,
    state.root,
    state,
    state.text,
    parentCtx,
    state.orderInfo,
    state.clippingPlanes,
    state.properties,
    state.svgWidth,
    state.svgHeight,
    state.isVisible,
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

  setupBoundingSphere(
    state.object.boundingSphere,
    state.properties.getSignal('pixelSize'),
    state.globalMatrix,
    state.size,
    abortSignal,
  )
}

const loader = new SVGLoader()

function setupIconGroup(
  object: Object3D,
  root: RootContext,
  flexState: FlexNodeState,
  text: string,
  parentContext: ParentContext | undefined,
  orderInfo: Signal<OrderInfo | undefined>,
  clippingPlanes: Array<Plane> | null,
  properties: Properties,
  svgWidth: number,
  svgHeight: number,
  isVisible: Signal<boolean>,
  abortSignal: AbortSignal,
): void {
  const result = loader.parse(text)
  const geometries: Array<BufferGeometry> = []
  const materials: Array<Material> = []

  for (const path of result.paths) {
    const shapes = SVGLoader.createShapes(path)
    const material = new MeshBasicMaterial()
    material.transparent = true
    material.depthWrite = false
    material.toneMapped = false
    material.clippingPlanes = clippingPlanes
    materials.push(material)

    for (const shape of shapes) {
      const geometry = new ShapeGeometry(shape)
      geometries.push(geometry)
      geometry.computeBoundingBox()
      const mesh = new Mesh(geometry, material)
      mesh.matrixAutoUpdate = false
      mesh.raycast = makeClippedCast(mesh, mesh.raycast, root.component, parentContext?.clippingRect, orderInfo, flexState)
      setupRenderOrder(mesh, root, orderInfo)
      mesh.userData.color = path.color
      mesh.scale.y = -1
      mesh.updateMatrix()
      object.add(mesh)
    }
  }

  const aspectRatio = svgWidth / svgHeight
  abortableEffect(() => {
    //TODO: integrate this into the object transformation computation
    fitNormalizedContentInside(
      object.position,
      object.scale,
      flexState.size,
      flexState.paddingInset,
      flexState.borderInset,
      properties.get('pixelSize'),
      aspectRatio,
    )
    object.position.x -= (object.scale.x * aspectRatio) / 2
    object.position.y += object.scale.x / 2
    object.scale.divideScalar(svgHeight)
    object.updateMatrix()
    root.requestRender?.()
  }, abortSignal)
  abortSignal.addEventListener('abort', () => {
    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
  })
  abortableEffect(() => {
    object.visible = isVisible.value
    root.requestRender?.()
  }, abortSignal)
  applyAppearancePropertiesToGroup(properties, object, abortSignal)
}
