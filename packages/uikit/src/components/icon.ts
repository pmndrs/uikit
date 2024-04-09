import { Signal, effect, signal } from '@preact/signals-core'
import { Color, Group, Mesh, MeshBasicMaterial, Plane, ShapeGeometry } from 'three'
import { Listeners } from '../index.js'
import { Object3DRef, ParentContext } from '../context.js'
import { FlexNode, YogaProperties } from '../flex/index.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { PanelProperties, createInstancedPanel } from '../panel/instanced-panel.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { ScrollbarProperties } from '../scroll.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import {
  WithConditionals,
  applyAppearancePropertiesToGroup,
  computedGlobalMatrix,
  computedHandlers,
  computedMergedProperties,
  createNode,
  keepAspectRatioPropertyTransformer,
} from './utils.js'
import { Subscriptions, fitNormalizedContentInside } from '../utils.js'
import { makeClippedRaycast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import {
  AppearanceProperties,
  MergedProperties,
  PanelGroupProperties,
  computedPanelGroupDependencies,
  darkPropertyTransformers,
  getDefaultPanelMaterialConfig,
} from '../internals.js'
import { SVGLoader } from 'three/examples/jsm/Addons.js'

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
          ScrollbarProperties
      >
    >
  >
>

export type IconProperties = InheritableIconProperties & Listeners

export function createIcon(
  parentContext: ParentContext,
  text: string,
  svgWidth: number,
  svgHeight: number,
  style: Signal<IconProperties | undefined>,
  properties: Signal<IconProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
) {
  const subscriptions: Subscriptions = []
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  setupCursorCleanup(hoveredSignal, subscriptions)

  const mergedProperties = computedMergedProperties(
    style,
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(parentContext.root.node.size),
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

  const node = createNode(parentContext, mergedProperties, object, subscriptions)

  const transformMatrix = computedTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)

  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const backgroundOrderInfo = computedOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentContext.orderInfo)
  createInstancedPanel(
    mergedProperties,
    backgroundOrderInfo,
    groupDeps,
    parentContext.root.panelGroupManager,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    parentContext.clippingRect,
    isClipped,
    getDefaultPanelMaterialConfig(),
    subscriptions,
  )

  const orderInfo = computedOrderInfo(undefined, ElementType.Svg, undefined, backgroundOrderInfo)

  const clippingPlanes = createGlobalClippingPlanes(parentContext.root, parentContext.clippingRect, subscriptions)
  const iconGroup = createIconGroup(
    mergedProperties,
    text,
    svgWidth,
    svgHeight,
    parentContext,
    orderInfo,
    node,
    isClipped,
    clippingPlanes,
    subscriptions,
  )

  setupLayoutListeners(style, properties, node.size, subscriptions)
  setupViewportListeners(style, properties, isClipped, subscriptions)

  return {
    root: parentContext.root,
    node,
    subscriptions,
    iconGroup,
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal),
    interactionPanel: createInteractionPanel(
      node,
      orderInfo,
      parentContext.root,
      parentContext.clippingRect,
      subscriptions,
    ),
  }
}

const loader = new SVGLoader()
const colorHelper = new Color()

function createIconGroup(
  propertiesSignal: Signal<MergedProperties>,
  text: string,
  svgWidth: number,
  svgHeight: number,
  parentContext: ParentContext,
  orderInfo: Signal<OrderInfo>,
  node: FlexNode,
  isClipped: Signal<boolean>,
  clippingPlanes: Array<Plane>,
  subscriptions: Subscriptions,
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
      mesh.raycast = makeClippedRaycast(
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
  subscriptions.push(
    effect(() => {
      const [offsetX, offsetY, scale] = fitNormalizedContentInside(
        node.size,
        node.paddingInset,
        node.borderInset,
        parentContext.root.pixelSize,
        aspectRatio,
      )
      group.position.set(offsetX - (scale * aspectRatio) / 2, offsetY + scale / 2, 0)
      group.scale.setScalar(scale / svgHeight)
      group.updateMatrix()
    }),
    effect(() => void (group.visible = !isClipped.value)),
  )
  applyAppearancePropertiesToGroup(propertiesSignal, group, subscriptions)
  return group
}
