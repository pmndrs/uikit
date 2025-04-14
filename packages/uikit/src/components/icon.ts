import { Signal, signal } from '@preact/signals-core'
import { BufferGeometry, Group, Material, Mesh, MeshBasicMaterial, Object3D, Plane, ShapeGeometry } from 'three'
import { EventHandlers, Listeners } from '../index.js'
import { ParentContext } from '../context.js'
import { FlexNodeState, YogaProperties, createFlexNodeState } from '../flex/index.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { PanelProperties, setupInstancedPanel } from '../panel/instanced-panel.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { ScrollbarProperties } from '../scroll.js'
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
  keepAspectRatioPropertyTransformer,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
} from './utils.js'
import { abortableEffect, fitNormalizedContentInside } from '../utils.js'
import { makeClippedCast, PointerEventsProperties } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { AppearanceProperties } from './svg.js'
import { PanelGroupProperties, computedPanelGroupDependencies, getDefaultPanelMaterialConfig } from '../panel/index.js'
import { darkPropertyTransformers } from '../dark.js'
import { MergedProperties } from '../properties/index.js'
import { ThreeEventMap } from '../events.js'

export type InheritableIconProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          ZIndexProperties &
          PanelProperties &
          AppearanceProperties &
          TransformProperties &
          PanelGroupProperties &
          ScrollbarProperties &
          VisibilityProperties &
          PointerEventsProperties
      >
    >
  >
>

export type IconProperties<EM extends ThreeEventMap = ThreeEventMap> = InheritableIconProperties &
  Listeners &
  EventHandlers<EM>

export function createIconState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  text: string,
  svgWidth: number,
  svgHeight: number,
  style: Signal<IconProperties<EM> | undefined>,
  properties: Signal<IconProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
) {
  const flexState = createFlexNodeState()
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])

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
    (m) => {
      m.add('aspectRatio', svgWidth / svgHeight)
      m.add('width', svgWidth)
      m.add('height', svgHeight)
    },
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

  const handlers = computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  const clippingPlanes = createGlobalClippingPlanes(parentCtx.root, parentCtx.clippingRect)

  return Object.assign(flexState, {
    root: parentCtx.root,
    hoveredSignal,
    activeSignal,
    mergedProperties,
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
      parentCtx.root,
      parentCtx.clippingRect,
      globalMatrix,
      flexState,
    ),
    iconGroup: createIconGroup(flexState, text, parentCtx, orderInfo, clippingPlanes),
  })
}

export function setupIcon<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createIconState>,
  parentCtx: ParentContext,
  style: Signal<IconProperties<EM> | undefined>,
  properties: Signal<IconProperties<EM> | undefined>,
  object: Object3D,
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

  setupIconGroup(
    state.iconGroup,
    state.mergedProperties,
    state.svgWidth,
    state.svgHeight,
    parentCtx,
    state,
    state.isVisible,
    abortSignal,
  )

  setupMatrixWorldUpdate(true, true, object, parentCtx.root, state.globalMatrix, false, abortSignal)

  setupPointerEvents(state.mergedProperties, state.ancestorsHaveListeners, parentCtx.root, object, false, abortSignal)

  setupLayoutListeners(style, properties, state.size, abortSignal)
  setupClippedListeners(style, properties, state.isClipped, abortSignal)

  setupInteractionPanel(state.interactionPanel, state.root, state.globalMatrix, state.size, abortSignal)
}

const loader = new SVGLoader()

function createIconGroup(
  flexState: FlexNodeState,
  text: string,
  parentContext: ParentContext,
  orderInfo: Signal<OrderInfo | undefined>,
  clippingPlanes: Array<Plane>,
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
        parentContext.root.objectRef,
        parentContext.clippingRect,
        orderInfo,
        flexState,
      )
      setupRenderOrder(mesh, parentContext.root, orderInfo)
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
  propertiesSignal: Signal<MergedProperties>,
  svgWidth: number,
  svgHeight: number,
  parentContext: ParentContext,
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
      parentContext.root.pixelSize.value,
      aspectRatio,
    )
    group.position.x -= (group.scale.x * aspectRatio) / 2
    group.position.y += group.scale.x / 2
    group.scale.divideScalar(svgHeight)
    group.updateMatrix()
    parentContext.root.requestRender()
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
    parentContext.root.requestRender()
  }, abortSignal)
  applyAppearancePropertiesToGroup(propertiesSignal, group, abortSignal)
}
