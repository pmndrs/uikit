import { Signal, effect, signal } from '@preact/signals-core'
import { BufferGeometry, Color, Group, Material, Mesh, MeshBasicMaterial, Plane, ShapeGeometry } from 'three'
import { Listeners } from '../index.js'
import { Object3DRef, ParentContext } from '../context.js'
import { FlexNode, FlexNodeState, YogaProperties, createFlexNodeState } from '../flex/index.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { PanelProperties, createInstancedPanel } from '../panel/instanced-panel.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { ScrollbarProperties } from '../scroll.js'
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
  keepAspectRatioPropertyTransformer,
  setupInteractableDecendant,
  setupMatrixWorldUpdate,
  setupPointerEvents,
} from './utils.js'
import { Initializers, Subscriptions, fitNormalizedContentInside } from '../utils.js'
import { makeClippedCast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { AppearanceProperties } from './svg.js'
import { PanelGroupProperties, computedPanelGroupDependencies, getDefaultPanelMaterialConfig } from '../panel/index.js'
import { darkPropertyTransformers } from '../dark.js'
import { computedInheritableProperty, MergedProperties } from '../properties/index.js'

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
          VisibilityProperties
      >
    >
  >
>

export type IconProperties = InheritableIconProperties & Listeners

export function createIcon(
  parentCtx: ParentContext,
  text: string,
  svgWidth: number,
  svgHeight: number,
  style: Signal<IconProperties | undefined>,
  properties: Signal<IconProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
) {
  const initializers: Initializers = []
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  setupCursorCleanup(hoveredSignal, initializers)

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

  const flexState = createFlexNodeState()
  createNode(undefined, flexState, parentCtx, mergedProperties, object, true, initializers)

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

  const clippingPlanes = createGlobalClippingPlanes(parentCtx.root, parentCtx.clippingRect)
  const iconGroup = createIconGroup(
    mergedProperties,
    text,
    svgWidth,
    svgHeight,
    parentCtx,
    orderInfo,
    flexState,
    isVisible,
    clippingPlanes,
    initializers,
  )

  setupMatrixWorldUpdate(true, true, object, parentCtx.root, globalMatrix, initializers, false)

  setupPointerEvents(mergedProperties, object, initializers)
  setupInteractableDecendant(parentCtx.root, object, initializers)

  setupLayoutListeners(style, properties, flexState.size, initializers)
  setupClippedListeners(style, properties, isClipped, initializers)

  return Object.assign(flexState, {
    isClipped,
    isVisible,
    mergedProperties,
    initializers,
    iconGroup,
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal),
    interactionPanel: createInteractionPanel(
      orderInfo,
      parentCtx.root,
      parentCtx.clippingRect,
      flexState.size,
      globalMatrix,
      initializers,
    ),
  })
}

const loader = new SVGLoader()

function createIconGroup(
  propertiesSignal: Signal<MergedProperties>,
  text: string,
  svgWidth: number,
  svgHeight: number,
  parentContext: ParentContext,
  orderInfo: Signal<OrderInfo | undefined>,
  flexState: FlexNodeState,
  isVisible: Signal<boolean>,
  clippingPlanes: Array<Plane>,
  initializers: Initializers,
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
        parentContext.root.object,
        parentContext.clippingRect,
        orderInfo,
      )
      setupRenderOrder(mesh, parentContext.root, orderInfo)
      mesh.userData.color = path.color
      mesh.scale.y = -1
      mesh.updateMatrix()
      group.add(mesh)
    }
  }
  const aspectRatio = svgWidth / svgHeight
  initializers.push(
    () =>
      effect(() => {
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
      }),
    () => () =>
      group.children.forEach((child) => {
        if (!(child instanceof Mesh)) {
          return
        }
        ;(child.geometry as BufferGeometry).dispose()
        ;(child.material as Material).dispose()
      }),
    () =>
      effect(() => {
        group.visible = isVisible.value
        parentContext.root.requestRender()
      }),
  )
  applyAppearancePropertiesToGroup(propertiesSignal, group, initializers, parentContext.root)
  return group
}
