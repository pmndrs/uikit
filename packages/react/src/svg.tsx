import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { ReactNode, RefObject, forwardRef, useMemo, useRef } from 'react'
import { YogaProperties } from '../flex/node.js'
import { useFlexNode } from '../flex/react.js'
import {
  InteractionGroup,
  MaterialClass,
  ShadowProperties,
  useInstancedPanel,
  useInteractionPanel,
  usePanelGroupDependencies,
} from '../panel/react.js'
import {
  WithReactive,
  createCollection,
  finalizeCollection,
  useGetBatchedProperties,
  writeCollection,
} from '../properties/utils.js'
import { useResourceWithParams, useSignalEffect, fitNormalizedContentInside, useRootGroupRef } from '../utils.js'
import { Box3, Color, Group, Mesh, MeshBasicMaterial, Plane, ShapeGeometry, Vector3 } from 'three'
import { computed, ReadonlySignal, Signal } from '@preact/signals-core'
import { useApplyHoverProperties } from '../hover.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import { Color as ColorRepresentation } from '@react-three/fiber'
import {
  ComponentInternals,
  LayoutListeners,
  ChildrenProvider,
  ViewportListeners,
  WithConditionals,
  useComponentInternals,
  useGlobalMatrix,
  useLayoutListeners,
  useViewportListeners,
} from './utils.js'
import { ClippingRect, useGlobalClippingPlanes, useIsClipped, useParentClippingRect } from '../clipping.js'
import { makeClippedRaycast } from '../panel/interaction-panel-mesh.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from '../properties/alias.js'
import { TransformProperties, useTransformMatrix } from '../transform.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { WithClasses, useApplyProperties } from '../properties/default.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { CameraDistanceRef, ElementType, OrderInfo, ZIndexOffset, setupRenderOrder, useOrderInfo } from '../order.js'
import { useApplyPreferredColorSchemeProperties } from '../dark.js'
import { useApplyActiveProperties } from '../active.js'
import { ScrollHandler, ScrollListeners, ScrollbarProperties, useScrollPosition, useScrollbars } from '../scroll.js'

export type SvgProperties = WithConditionals<
  WithClasses<
    WithAllAliases<
      WithReactive<YogaProperties & PanelProperties & TransformProperties & AppearanceProperties> & ScrollbarProperties
    >
  >
>

export type AppearanceProperties = {
  opacity?: number
  color?: ColorRepresentation
}

const loader = new SVGLoader()

const box3Helper = new Box3()
const vectorHelper = new Vector3()

async function loadSvg(
  url: string,
  cameraDistance: CameraDistanceRef,
  MaterialClass: MaterialClass = MeshBasicMaterial,
  clippingPlanes: Array<Plane>,
  clippedRect: Signal<ClippingRect | undefined> | undefined,
  rootGroupRef: RefObject<Group>,
  orderInfo: OrderInfo,
) {
  const object = new Group()
  object.matrixAutoUpdate = false
  const result = await loader.loadAsync(url)
  box3Helper.makeEmpty()
  for (const path of result.paths) {
    const shapes = SVGLoader.createShapes(path)
    const material = new MaterialClass()
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
      mesh.raycast = makeClippedRaycast(mesh, mesh.raycast, rootGroupRef, clippedRect, orderInfo)
      setupRenderOrder(mesh, cameraDistance, orderInfo)
      mesh.userData.color = path.color
      mesh.scale.y = -1
      mesh.updateMatrix()
      object.add(mesh)
    }
  }
  box3Helper.getSize(vectorHelper)
  const aspectRatio = vectorHelper.x / vectorHelper.y
  const scale = 1 / vectorHelper.y
  object.scale.set(1, 1, 1).multiplyScalar(scale)
  box3Helper.getCenter(vectorHelper)
  vectorHelper.y *= -1
  object.position.copy(vectorHelper).negate().multiplyScalar(scale)
  object.updateMatrix()

  return Object.assign(object, { aspectRatio })
}

const colorHelper = new Color()

const propertyKeys = ['color', 'opacity'] as const

export const Svg = forwardRef<
  ComponentInternals,
  {
    zIndexOffset?: ZIndexOffset
    children?: ReactNode
    src: string | ReadonlySignal<string>
    materialClass?: MaterialClass
    panelMaterialClass?: MaterialClass
  } & SvgProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners &
    ShadowProperties &
    ScrollListeners
>((properties, ref) => {
  const collection = createCollection()
  const groupRef = useRef<Group>(null)
  const node = useFlexNode(groupRef)
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  const transformMatrix = useTransformMatrix(collection, node)
  const globalMatrix = useGlobalMatrix(transformMatrix)
  const parentClippingRect = useParentClippingRect()
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)
  const groupDeps = usePanelGroupDependencies(properties.panelMaterialClass, properties)
  const backgroundOrderInfo = useOrderInfo(ElementType.Panel, properties.zIndexOffset, groupDeps)
  useInstancedPanel(
    collection,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    isClipped,
    backgroundOrderInfo,
    parentClippingRect,
    groupDeps,
    panelAliasPropertyTransformation,
  )

  const rootGroupRef = useRootGroupRef()
  const clippingPlanes = useGlobalClippingPlanes(parentClippingRect, rootGroupRef)
  const orderInfo = useOrderInfo(ElementType.Svg, undefined, undefined, backgroundOrderInfo)
  const svgObject = useResourceWithParams(
    loadSvg,
    properties.src,
    node.cameraDistance,
    properties.materialClass,
    clippingPlanes,
    parentClippingRect,
    rootGroupRef,
    orderInfo,
  )

  const getPropertySignal = useGetBatchedProperties<AppearanceProperties>(collection, propertyKeys)
  useSignalEffect(() => {
    const get = getPropertySignal.value
    if (get == null) {
      return
    }
    const colorRepresentation = get('color')
    const opacity = get('opacity')
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
      object.receiveShadow = properties.receiveShadow ?? false
      object.castShadow = properties.castShadow ?? false
      const material: MeshBasicMaterial = object.material
      material.color.copy(color ?? object.userData.color)
      material.opacity = opacity ?? 1
    })
  }, [svgObject, properties.color, properties.receiveShadow, properties.castShadow])
  const aspectRatio = useMemo(() => computed(() => svgObject.value?.aspectRatio), [svgObject])

  const scrollPosition = useScrollPosition()
  useScrollbars(
    collection,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    properties.scrollbarPanelMaterialClass,
    parentClippingRect,
    orderInfo,
  )

  //apply all properties
  useApplyProperties(collection, properties)
  useApplyPreferredColorSchemeProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  const activeHandlers = useApplyActiveProperties(collection, properties)
  writeCollection(collection, 'aspectRatio', aspectRatio)
  finalizeCollection(collection)

  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)

  const centerGroup = useMemo(() => {
    const group = new Group()
    group.matrixAutoUpdate = false
    return group
  }, [])

  useSignalEffect(() => {
    const [offsetX, offsetY, scale] = fitNormalizedContentInside(
      node.size,
      node.paddingInset,
      node.borderInset,
      node.pixelSize,
      svgObject.value?.aspectRatio ?? 1,
    )
    centerGroup.position.set(offsetX, offsetY, 0)
    centerGroup.scale.setScalar(scale)
    centerGroup.updateMatrix()
  }, [node, svgObject])

  useSignalEffect(() => {
    const object = svgObject.value
    if (object == null) {
      return
    }
    centerGroup.add(object)
    return () => centerGroup.remove(object)
  }, [svgObject, centerGroup])

  useSignalEffect(() => void (centerGroup.visible = !isClipped.value), [])

  const interactionPanel = useInteractionPanel(node.size, node, backgroundOrderInfo, rootGroupRef)

  useComponentInternals(ref, node, interactionPanel, scrollPosition)

  return (
    <InteractionGroup
      groupRef={groupRef}
      matrix={transformMatrix}
      handlers={properties}
      hoverHandlers={hoverHandlers}
      activeHandlers={activeHandlers}
    >
      <ScrollHandler listeners={properties} node={node} scrollPosition={scrollPosition}>
        <primitive object={interactionPanel} />
        <primitive object={centerGroup} />
        <ChildrenProvider globalMatrix={globalMatrix} node={node} orderInfo={orderInfo} scrollPosition={scrollPosition}>
          {properties.children}
        </ChildrenProvider>
      </ScrollHandler>
    </InteractionGroup>
  )
})
