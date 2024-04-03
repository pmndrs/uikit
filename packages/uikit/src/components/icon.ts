import { Signal, effect, signal } from '@preact/signals-core'
import { Group, Mesh, MeshBasicMaterial, Plane, ShapeGeometry } from 'three'
import { Listeners } from '../index.js'
import { Object3DRef, WithContext } from '../context.js'
import { FlexNode, YogaProperties } from '../flex/index.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import {
  ScrollbarProperties,
  applyScrollPosition,
  computedGlobalScrollMatrix,
  createScrollPosition,
  createScrollbars,
  setupScrollHandler,
} from '../scroll.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import {
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedMergedProperties,
  createNode,
  keepAspectRatioPropertyTransformer,
} from './utils.js'
import { ColorRepresentation, Subscriptions, fitNormalizedContentInside } from '../utils.js'
import { makeClippedRaycast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, computedClippingRect, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { EventHandlers } from '../events.js'
import { AppearanceProperties, PanelGroupProperties, darkPropertyTransformers } from '../internals.js'
import { SVGLoader } from 'three/examples/jsm/Addons.js'

export type InheritableIconProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          ZIndexProperties &
          Omit<PanelProperties, 'backgroundColor' | 'backgroundOpacity'> &
          AppearanceProperties &
          TransformProperties &
          PanelGroupProperties &
          ScrollbarProperties
      >
    >
  >
>

export type IconProperties = InheritableIconProperties & Listeners & EventHandlers

export function createIcon(
  parentContext: WithContext,
  text: string,
  svgWidth: number,
  svgHeight: number,
  properties: Signal<IconProperties>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
) {
  const subscriptions: Subscriptions = []
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  setupCursorCleanup(hoveredSignal, subscriptions)

  const mergedProperties = computedMergedProperties(
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

  const orderInfo = computedOrderInfo(mergedProperties, ElementType.Svg, undefined, parentContext.orderInfo)

  const clippingPlanes = createGlobalClippingPlanes(parentContext.root, parentContext.clippingRect, subscriptions)
  const iconGroup = createIconGroup(
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

  setupLayoutListeners(properties, node.size, subscriptions)
  setupViewportListeners(properties, isClipped, subscriptions)

  return {
    clippingRect: computedClippingRect(
      globalMatrix,
      node.size,
      node.borderInset,
      node.overflow,
      parentContext.root.pixelSize,
      parentContext.clippingRect,
    ),
    node,
    object,
    orderInfo,
    root: parentContext.root,
    subscriptions,
    iconGroup,
    handlers: computedHandlers(properties, defaultProperties, hoveredSignal, activeSignal),
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

function createIconGroup(
  text: string,
  svgWidth: number,
  svgHeight: number,
  parentContext: WithContext,
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
  return group
}
