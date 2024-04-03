import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Box3, Color, Group, Mesh, MeshBasicMaterial, Object3D, Plane, ShapeGeometry, Vector3 } from 'three'
import { Listeners } from '../index.js'
import { Object3DRef, ParentContext } from '../context.js'
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
  loadResourceWithParams,
} from './utils.js'
import { MergedProperties } from '../properties/merged.js'
import { ColorRepresentation, Subscriptions, fitNormalizedContentInside, readReactive } from '../utils.js'
import { makeClippedRaycast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, computedClippingRect, ClippingRect, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { EventHandlers } from '../events.js'
import {
  PanelGroupProperties,
  RootContext,
  ShadowProperties,
  createGetBatchedProperties,
  darkPropertyTransformers,
} from '../internals.js'
import { SVGLoader } from 'three/examples/jsm/Addons.js'

export type InheritableSVGProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          ZIndexProperties &
          Omit<PanelProperties, 'backgroundColor' | 'backgroundOpacity'> &
          AppearanceProperties & {
            keepAspectRatio?: boolean
          } & TransformProperties &
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

export type SVGProperties = InheritableSVGProperties & Listeners & EventHandlers

export function createSVG(
  parentContext: ParentContext,
  srcSignal: Signal<Signal<string> | string>,
  properties: Signal<SVGProperties>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
) {
  const subscriptions: Subscriptions = []
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  setupCursorCleanup(hoveredSignal, subscriptions)

  const aspectRatio = signal<number | undefined>(undefined)

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
    (m) => m.add('aspectRatio', aspectRatio),
  )

  const node = createNode(parentContext, mergedProperties, object, subscriptions)

  const transformMatrix = computedTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)

  const orderInfo = computedOrderInfo(mergedProperties, ElementType.Svg, undefined, parentContext.orderInfo)

  const src = computed(() => readReactive(srcSignal.value))
  const svgObject = signal<Object3D | undefined>(undefined)
  const clippingPlanes = createGlobalClippingPlanes(parentContext.root, parentContext.clippingRect, subscriptions)
  loadResourceWithParams(
    svgObject,
    loadSVG,
    subscriptions,
    src,
    parentContext.root,
    clippingPlanes,
    parentContext.clippingRect,
    orderInfo,
    aspectRatio,
  )
  applySVGProperties(mergedProperties, parentContext.root, orderInfo, svgObject, subscriptions)
  const centerGroup = createCenterGroup(
    node,
    parentContext.root.pixelSize,
    svgObject,
    aspectRatio,
    isClipped,
    subscriptions,
  )

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentContext.root.pixelSize)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentContext.root.pixelSize)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    parentContext.clippingRect,
    orderInfo,
    parentContext.root.panelGroupManager,
    subscriptions,
  )
  const scrollHandlers = setupScrollHandler(
    node,
    scrollPosition,
    object,
    properties,
    parentContext.root.pixelSize,
    parentContext.root.onFrameSet,
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
    childrenMatrix,
    node,
    orderInfo,
    root: parentContext.root,
    subscriptions,
    centerGroup,
    handlers: computedHandlers(properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers),
    interactionPanel: createInteractionPanel(
      node,
      orderInfo,
      parentContext.root,
      parentContext.clippingRect,
      subscriptions,
    ),
  }
}

function createCenterGroup(
  node: FlexNode,
  pixelSize: number,
  svgObject: Signal<Object3D | undefined>,
  aspectRatio: Signal<number | undefined>,
  isClipped: Signal<boolean>,
  subscriptions: Subscriptions,
): Group {
  const centerGroup = new Group()
  centerGroup.matrixAutoUpdate = false
  subscriptions.push(
    effect(() => {
      const [offsetX, offsetY, scale] = fitNormalizedContentInside(
        node.size,
        node.paddingInset,
        node.borderInset,
        pixelSize,
        aspectRatio.value ?? 1,
      )
      centerGroup.position.set(offsetX, offsetY, 0)
      centerGroup.scale.setScalar(scale)
      centerGroup.updateMatrix()
    }),
    effect(() => {
      const object = svgObject.value
      if (object == null) {
        return
      }
      centerGroup.add(object)
      return () => centerGroup.remove(object)
    }),
    effect(() => void (centerGroup.visible = svgObject.value != null && !isClipped.value)),
  )
  return centerGroup
}

const loader = new SVGLoader()

const box3Helper = new Box3()
const vectorHelper = new Vector3()
const colorHelper = new Color()

const propertyKeys = ['opacity', 'color', 'receiveShadow', 'castShadow'] as const

function applySVGProperties(
  propertiesSignal: Signal<MergedProperties>,
  root: RootContext,
  orderInfo: Signal<OrderInfo>,
  svgObject: Signal<Object3D | undefined>,
  subscriptions: Subscriptions,
) {
  const getPropertySignal = createGetBatchedProperties<AppearanceProperties & ShadowProperties>(
    propertiesSignal,
    propertyKeys,
  )
  subscriptions.push(
    effect(() => {
      const colorRepresentation = getPropertySignal('color')
      const opacity = getPropertySignal('opacity')
      const receiveShadow = getPropertySignal('receiveShadow')
      const castShadow = getPropertySignal('castShadow')
      let color: Color | undefined
      if (Array.isArray(colorRepresentation)) {
        color = colorHelper.setRGB(...colorRepresentation)
      } else if (colorRepresentation != null) {
        color = colorHelper.set(colorRepresentation)
      }
      svgObject.value?.traverse((object) => {
        if (!(object instanceof Mesh)) {
          return
        }
        object.receiveShadow = receiveShadow ?? false
        object.castShadow = castShadow ?? false
        setupRenderOrder(object, root, orderInfo)
        const material: MeshBasicMaterial = object.material
        material.color.copy(color ?? object.userData.color)
        material.opacity = opacity ?? 1
      })
    }),
  )
}

async function loadSVG(
  url: string,
  root: RootContext,
  clippingPlanes: Array<Plane>,
  clippedRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo>,
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
