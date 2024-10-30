import { Signal, computed, effect, signal } from '@preact/signals-core'
import {
  Box3,
  BufferGeometry,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Plane,
  ShapeGeometry,
  Vector3,
} from 'three'
import { Listeners } from '../index.js'
import { Object3DRef, ParentContext, RootContext } from '../context.js'
import { FlexNode, FlexNodeState, YogaProperties, createFlexNodeState } from '../flex/index.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { PanelProperties, createInstancedPanel } from '../panel/instanced-panel.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import {
  ScrollbarProperties,
  applyScrollPosition,
  computedGlobalScrollMatrix,
  createScrollPosition,
  createScrollbars,
  computedScrollHandlers,
  computedAnyAncestorScrollable,
} from '../scroll.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import {
  VisibilityProperties,
  WithConditionals,
  applyAppearancePropertiesToGroup,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  createNode,
  disposeGroup,
  keepAspectRatioPropertyTransformer,
  loadResourceWithParams,
} from './utils.js'
import { ColorRepresentation, Initializers, fitNormalizedContentInside, readReactive } from '../utils.js'
import { makeClippedCast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, computedClippingRect, ClippingRect, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js'
import { darkPropertyTransformers } from '../dark.js'
import { PanelGroupProperties, computedPanelGroupDependencies, getDefaultPanelMaterialConfig } from '../panel/index.js'
import { KeepAspectRatioProperties } from './image.js'
import { computedInheritableProperty, setupMatrixWorldUpdate } from '../internals.js'

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
          VisibilityProperties
      >
    >
  >
>
export type AppearanceProperties = {
  opacity?: number
  color?: ColorRepresentation
}

export type SvgProperties = InheritableSvgProperties &
  Listeners & {
    src?: Signal<string> | string
    keepAspectRatio?: boolean
  }

export function createSvg(
  parentCtx: ParentContext,
  style: Signal<SvgProperties | undefined>,
  properties: Signal<SvgProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
) {
  const initializers: Initializers = []
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  setupCursorCleanup(hoveredSignal, initializers)

  const aspectRatio = signal<number | undefined>(undefined)

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

  const node = signal<FlexNode | undefined>(undefined)
  const flexState = createFlexNodeState()
  createNode(node, flexState, parentCtx, mergedProperties, object, true, initializers)

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentCtx.root.pixelSize)
  applyTransform(parentCtx.root, object, transformMatrix, initializers)

  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentCtx.clippingRect, globalMatrix, flexState.size, parentCtx.root.pixelSize)
  const isVisible = computedIsVisible(flexState, isClipped, mergedProperties)

  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const backgroundOrderInfo = computedOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentCtx.orderInfo)
  initializers.push((subscriptions) =>
    createInstancedPanel(
      mergedProperties,
      backgroundOrderInfo,
      groupDeps,
      parentCtx.root.panelGroupManager,
      globalMatrix,
      flexState.size,
      undefined,
      flexState.borderInset,
      parentCtx.clippingRect,
      isVisible,
      getDefaultPanelMaterialConfig(),
      subscriptions,
    ),
  )

  const orderInfo = computedOrderInfo(undefined, ElementType.Svg, undefined, backgroundOrderInfo)

  const src = computed(() => readReactive(style.value?.src) ?? readReactive(properties.value?.src))
  const svgObject = signal<Object3D | undefined>(undefined)
  const clippingPlanes = createGlobalClippingPlanes(parentCtx.root, parentCtx.clippingRect)
  loadResourceWithParams(
    svgObject,
    loadSvg,
    disposeGroup,
    initializers,
    src,
    parentCtx.root,
    clippingPlanes,
    parentCtx.clippingRect,
    orderInfo,
    aspectRatio,
  )
  applyAppearancePropertiesToGroup(mergedProperties, svgObject, initializers, parentCtx.root)
  const centerGroup = createCenterGroup(parentCtx.root, flexState, svgObject, aspectRatio, isVisible, initializers)

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentCtx.root.pixelSize, initializers)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentCtx.root.pixelSize)
  const scrollbarWidth = computedInheritableProperty(mergedProperties, 'scrollbarWidth', 10)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    flexState,
    globalMatrix,
    isVisible,
    parentCtx.clippingRect,
    orderInfo,
    parentCtx.root.panelGroupManager,
    scrollbarWidth,
    initializers,
  )

  const interactionPanel = createInteractionPanel(
    orderInfo,
    parentCtx.root,
    parentCtx.clippingRect,
    flexState.size,
    globalMatrix,
    initializers,
  )

  setupMatrixWorldUpdate(true, true, object, parentCtx.root, globalMatrix, initializers, false)

  const scrollHandlers = computedScrollHandlers(
    scrollPosition,
    parentCtx.anyAncestorScrollable,
    flexState,
    object,
    scrollbarWidth,
    properties,
    parentCtx.root,
    initializers,
  )

  setupLayoutListeners(style, properties, flexState.size, initializers)
  setupClippedListeners(style, properties, isClipped, initializers)

  return Object.assign(flexState, {
    scrollPosition,
    isClipped,
    isVisible,
    mergedProperties,
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx.anyAncestorScrollable),
    clippingRect: computedClippingRect(globalMatrix, flexState, parentCtx.root.pixelSize, parentCtx.clippingRect),
    childrenMatrix,
    node,
    orderInfo,
    root: parentCtx.root,
    initializers,
    centerGroup,
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers),
    interactionPanel,
  })
}

function createCenterGroup(
  root: RootContext,
  flexState: FlexNodeState,
  svgObject: Signal<Object3D | undefined>,
  aspectRatio: Signal<number | undefined>,
  isVisible: Signal<boolean>,
  initializers: Initializers,
): Group {
  const centerGroup = new Group()
  centerGroup.matrixAutoUpdate = false
  initializers.push(
    () =>
      effect(() => {
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
      }),
    () =>
      effect(() => {
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
      }),
    () =>
      effect(() => {
        void (centerGroup.visible = svgObject.value != null && isVisible.value)
        root.requestRender()
      }),
  )
  return centerGroup
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
      mesh.raycast = makeClippedCast(mesh, mesh.raycast, root.object, clippedRect, orderInfo)
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
