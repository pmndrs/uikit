import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Box3, Group, Mesh, MeshBasicMaterial, Object3D, Plane, ShapeGeometry, Vector3 } from 'three'
import { Listeners } from '../index.js'
import { Object3DRef, ParentContext } from '../context.js'
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
} from '../scroll.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import {
  WithConditionals,
  applyAppearancePropertiesToGroup,
  computedGlobalMatrix,
  computedHandlers,
  computedMergedProperties,
  createNode,
  keepAspectRatioPropertyTransformer,
  loadResourceWithParams,
} from './utils.js'
import { ColorRepresentation, Initializers, fitNormalizedContentInside, readReactive } from '../utils.js'
import { makeClippedRaycast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, computedClippingRect, ClippingRect, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import {
  KeepAspectRatioProperties,
  PanelGroupProperties,
  RootContext,
  computedPanelGroupDependencies,
  darkPropertyTransformers,
  getDefaultPanelMaterialConfig,
} from '../internals.js'
import { SVGLoader } from 'three/examples/jsm/Addons.js'

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
          ScrollbarProperties
      >
    >
  >
>
export type AppearanceProperties = {
  opacity?: number
  color?: ColorRepresentation
}

export type SvgProperties = InheritableSvgProperties & Listeners

export function createSvg(
  parentContext: ParentContext,
  srcSignal: Signal<Signal<string> | string>,
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
      ...createResponsivePropertyTransformers(parentContext.root.size),
      ...createHoverPropertyTransformers(hoveredSignal),
      ...createActivePropertyTransfomers(activeSignal),
    },
    keepAspectRatioPropertyTransformer,
    (m) => m.add('aspectRatio', aspectRatio),
  )

  const node = signal<FlexNode | undefined>(undefined)
  const flexState = createFlexNodeState(parentContext.anyAncestorScrollable)
  createNode(node, flexState, parentContext, mergedProperties, object, initializers)

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, initializers)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(
    parentContext.clippingRect,
    globalMatrix,
    flexState.size,
    parentContext.root.pixelSize,
  )

  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const backgroundOrderInfo = computedOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentContext.orderInfo)
  initializers.push((subscriptions) =>
    createInstancedPanel(
      mergedProperties,
      backgroundOrderInfo,
      groupDeps,
      parentContext.root.panelGroupManager,
      globalMatrix,
      flexState.size,
      undefined,
      flexState.borderInset,
      parentContext.clippingRect,
      isClipped,
      getDefaultPanelMaterialConfig(),
      subscriptions,
    ),
  )

  const orderInfo = computedOrderInfo(undefined, ElementType.Svg, undefined, backgroundOrderInfo)

  const src = computed(() => readReactive(srcSignal.value))
  const svgObject = signal<Object3D | undefined>(undefined)
  const clippingPlanes = createGlobalClippingPlanes(parentContext.root, parentContext.clippingRect, initializers)
  loadResourceWithParams(
    svgObject,
    loadSvg,
    initializers,
    src,
    parentContext.root,
    clippingPlanes,
    parentContext.clippingRect,
    orderInfo,
    aspectRatio,
  )
  applyAppearancePropertiesToGroup(mergedProperties, svgObject, initializers)
  const centerGroup = createCenterGroup(
    flexState,
    parentContext.root.pixelSize,
    svgObject,
    aspectRatio,
    isClipped,
    initializers,
  )

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentContext.root.pixelSize, initializers)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentContext.root.pixelSize)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    flexState,
    globalMatrix,
    isClipped,
    parentContext.clippingRect,
    orderInfo,
    parentContext.root.panelGroupManager,
    initializers,
  )
  const scrollHandlers = computedScrollHandlers(
    scrollPosition,
    flexState,
    object,
    properties,
    parentContext.root.pixelSize,
    parentContext.root.onFrameSet,
    initializers,
  )

  setupLayoutListeners(style, properties, flexState.size, initializers)
  setupViewportListeners(style, properties, isClipped, initializers)

  return Object.assign(flexState, {
    clippingRect: computedClippingRect(
      globalMatrix,
      flexState,
      parentContext.root.pixelSize,
      parentContext.clippingRect,
    ),
    childrenMatrix,
    node,
    orderInfo,
    root: parentContext.root,
    initializers,
    centerGroup,
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers),
    interactionPanel: createInteractionPanel(
      orderInfo,
      parentContext.root,
      parentContext.clippingRect,
      flexState.size,
      initializers,
    ),
  })
}

function createCenterGroup(
  flexState: FlexNodeState,
  pixelSize: Signal<number>,
  svgObject: Signal<Object3D | undefined>,
  aspectRatio: Signal<number | undefined>,
  isClipped: Signal<boolean>,
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
          pixelSize.value,
          aspectRatio.value ?? 1,
        )
        centerGroup.updateMatrix()
      }),
    () =>
      effect(() => {
        const object = svgObject.value
        if (object == null) {
          return
        }
        centerGroup.add(object)
        return () => centerGroup.remove(object)
      }),
    () => effect(() => void (centerGroup.visible = svgObject.value != null && !isClipped.value)),
  )
  return centerGroup
}

const loader = new SVGLoader()

const box3Helper = new Box3()
const vectorHelper = new Vector3()

async function loadSvg(
  url: string,
  root: RootContext,
  clippingPlanes: Array<Plane>,
  clippedRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo | undefined>,
  aspectRatio: Signal<number | undefined>,
) {
  const object = new Group()
  object.matrixAutoUpdate = false
  const result = await loader.loadAsync(url)
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
      mesh.raycast = makeClippedRaycast(mesh, mesh.raycast, root.object, clippedRect, orderInfo)
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
