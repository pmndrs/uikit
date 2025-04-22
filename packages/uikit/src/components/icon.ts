import { Signal, signal } from '@preact/signals-core'
import { BufferGeometry, Group, Material, Mesh, MeshBasicMaterial, Object3D, Plane, ShapeGeometry } from 'three'
import { ParentContext } from '../context.js'
import { FlexNodeState, createFlexNodeState } from '../flex/index.js'
import { ElementType, OrderInfo, computedOrderInfo, setupRenderOrder } from '../order.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { setupObjectTransform, computedTransformMatrix } from '../transform.js'
import {
  applyAppearancePropertiesToGroup,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  setupNode,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
} from './utils.js'
import { abortableEffect, fitNormalizedContentInside } from '../utils.js'
import { makeClippedCast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { computedPanelGroupDependencies, getDefaultPanelMaterialConfig } from '../panel/index.js'
import { ThreeEventMap } from '../events.js'
import { setupCursorCleanup } from '../hover.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { computedRootMatrix, createRootContext, RenderContext, RootContext, setupRootContext } from './index.js'

export type IconProperties<EM extends ThreeEventMap> = AllProperties<EM, {}>

export function createIconState<EM extends ThreeEventMap = ThreeEventMap>(
  text: string,
  svgWidth: number,
  svgHeight: number,
  objectRef: { current?: Object3D | null },
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = createRootContext(parentCtx, objectRef, flexState.size, renderContext)
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

  const orderInfo = computedOrderInfo(undefined, 'zIndexOffset', ElementType.Svg, undefined, backgroundOrderInfo)

  const handlers = computedHandlers(properties, hoveredSignal, activeSignal)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  const clippingPlanes = createGlobalClippingPlanes(rootContext.root, parentCtx?.clippingRect)

  return Object.assign(flexState, rootContext, {
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
    interactionPanel: createInteractionPanel(
      orderInfo,
      rootContext.root,
      parentCtx?.clippingRect,
      globalMatrix,
      flexState,
    ),
    iconGroup: createIconGroup(rootContext.root, flexState, text, parentCtx, orderInfo, clippingPlanes),
  })
}

export function setupIcon(
  state: ReturnType<typeof createIconState>,
  parentCtx: ParentContext | undefined,
  object: Object3D,
  abortSignal: AbortSignal,
) {
  setupRootContext(state, object, undefined, abortSignal)
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  setupNode(state, parentCtx, object, true, abortSignal)
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

  setupIconGroup(
    state.iconGroup,
    state.properties,
    state.svgWidth,
    state.svgHeight,
    state.root,
    state,
    state.isVisible,
    abortSignal,
  )

  setupMatrixWorldUpdate(true, true, object, state.root, state.globalMatrix, false, abortSignal)

  setupPointerEvents(state.properties, state.ancestorsHaveListeners, state.root, object, false, abortSignal)

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)

  setupInteractionPanel(state.properties, state.interactionPanel, state.globalMatrix, state.size, abortSignal)
}

const loader = new SVGLoader()

function createIconGroup(
  root: RootContext,
  flexState: FlexNodeState,
  text: string,
  parentContext: ParentContext | undefined,
  orderInfo: Signal<OrderInfo | undefined>,
  clippingPlanes: Array<Plane> | null,
): Group {
  const group = new Group()
  group.matrixAutoUpdate = false
  const result = loader.parse(text)

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
      const mesh = new Mesh(geometry, material)
      mesh.matrixAutoUpdate = false
      mesh.raycast = makeClippedCast(
        mesh,
        mesh.raycast,
        root.objectRef,
        parentContext?.clippingRect,
        orderInfo,
        flexState,
      )
      setupRenderOrder(mesh, root, orderInfo)
      mesh.userData.color = path.color
      mesh.scale.y = -1
      mesh.updateMatrix()
      group.add(mesh)
    }
  }
  return group
}

function setupIconGroup(
  group: Group,
  properties: Properties,
  svgWidth: number,
  svgHeight: number,
  root: RootContext,
  flexState: FlexNodeState,
  isVisible: Signal<boolean>,
  abortSignal: AbortSignal,
) {
  const aspectRatio = svgWidth / svgHeight
  abortableEffect(() => {
    fitNormalizedContentInside(
      group.position,
      group.scale,
      flexState.size,
      flexState.paddingInset,
      flexState.borderInset,
      properties.get('pixelSize'),
      aspectRatio,
    )
    group.position.x -= (group.scale.x * aspectRatio) / 2
    group.position.y += group.scale.x / 2
    group.scale.divideScalar(svgHeight)
    group.updateMatrix()
    root.requestRender?.()
  }, abortSignal)
  abortSignal.addEventListener('abort', () =>
    group.children.forEach((child) => {
      if (!(child instanceof Mesh)) {
        return
      }
      ;(child.geometry as BufferGeometry).dispose()
      ;(child.material as Material).dispose()
    }),
  )
  abortableEffect(() => {
    group.visible = isVisible.value
    root.requestRender?.()
  }, abortSignal)
  applyAppearancePropertiesToGroup(properties, group, abortSignal)
}
