import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { ReactNode, forwardRef, useMemo, useRef } from 'react'
import { useFlexNode } from '../flex/react.js'
import {
  InteractionGroup,
  MaterialClass,
  ShadowProperties,
  useInstancedPanel,
  useInteractionPanel,
  usePanelGroupDependencies,
} from '../panel/react.js'
import { createCollection, finalizeCollection, useGetBatchedProperties, writeCollection } from '../properties/utils.js'
import { useSignalEffect, fitNormalizedContentInside, useRootGroupRef } from '../utils.js'
import { Color, Group, Mesh, MeshBasicMaterial, ShapeGeometry } from 'three'
import { useApplyHoverProperties } from '../hover.js'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import {
  ComponentInternals,
  LayoutListeners,
  ViewportListeners,
  useComponentInternals,
  useGlobalMatrix,
  useLayoutListeners,
  useViewportListeners,
} from './utils.js'
import { useGlobalClippingPlanes, useIsClipped, useParentClippingRect } from '../clipping.js'
import { makeClippedRaycast } from '../panel/interaction-panel-mesh.js'
import { flexAliasPropertyTransformation, panelAliasPropertyTransformation } from '../properties/alias.js'
import { useTransformMatrix } from '../transform.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { useApplyProperties } from '../properties/default.js'
import { SvgProperties, AppearanceProperties } from './svg.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { ElementType, ZIndexOffset, setupRenderOrder, useOrderInfo } from '../order.js'
import { useApplyPreferredColorSchemeProperties } from '../dark.js'
import { useApplyActiveProperties } from '../active.js'

const colorHelper = new Color()

const propertyKeys = ['color', 'opacity'] as const

const loader = new SVGLoader()

export const SvgIconFromText = forwardRef<
  ComponentInternals,
  {
    children?: ReactNode
    text: string
    svgWidth: number
    svgHeight: number
    zIndexOffset?: ZIndexOffset
    materialClass?: MaterialClass
    backgroundMaterialClass?: MaterialClass
  } & SvgProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners &
    ShadowProperties
>((properties, ref) => {
  const collection = createCollection()
  const groupRef = useRef<Group>(null)
  const node = useFlexNode(groupRef)
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  const transformMatrix = useTransformMatrix(collection, node)
  const globalMatrix = useGlobalMatrix(transformMatrix)
  const parentClippingRect = useParentClippingRect()
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)

  const groupDeps = usePanelGroupDependencies(properties.backgroundMaterialClass, properties)
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
  const svgGroup = useMemo(() => {
    const group = new Group()
    group.matrixAutoUpdate = false
    const result = loader.parse(properties.text)

    for (const path of result.paths) {
      const shapes = SVGLoader.createShapes(path)
      const material = new (properties.materialClass ?? MeshBasicMaterial)()
      material.transparent = true
      material.depthWrite = false
      material.toneMapped = false
      material.clippingPlanes = clippingPlanes

      for (const shape of shapes) {
        const geometry = new ShapeGeometry(shape)
        geometry.computeBoundingBox()
        const mesh = new Mesh(geometry, material)
        mesh.matrixAutoUpdate = false
        mesh.raycast = makeClippedRaycast(mesh, mesh.raycast, rootGroupRef, parentClippingRect, orderInfo)
        setupRenderOrder(mesh, node.cameraDistance, orderInfo)
        mesh.userData.color = path.color
        mesh.scale.y = -1
        mesh.updateMatrix()
        group.add(mesh)
      }
    }

    return group
  }, [properties.text, properties.materialClass, clippingPlanes, rootGroupRef, parentClippingRect, node, orderInfo])

  const getPropertySignal = useGetBatchedProperties<AppearanceProperties>(collection, propertyKeys)
  useSignalEffect(() => {
    const colorRepresentation = getPropertySignal.value('color')
    const opacity = getPropertySignal.value('opacity')
    let color: Color | undefined
    if (Array.isArray(colorRepresentation)) {
      color = colorHelper.setRGB(...colorRepresentation)
    } else if (colorRepresentation != null) {
      color = colorHelper.set(colorRepresentation)
    }
    svgGroup.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return
      }
      object.receiveShadow = properties.receiveShadow ?? false
      object.castShadow = properties.castShadow ?? false
      const material: MeshBasicMaterial = object.material
      material.color.copy(color ?? object.userData.color)
      material.opacity = opacity ?? 1
    })
  }, [svgGroup, properties.color, properties.receiveShadow, properties.castShadow])

  //apply all properties
  writeCollection(collection, 'width', properties.svgWidth)
  writeCollection(collection, 'height', properties.svgHeight)
  useApplyProperties(collection, properties)
  useApplyPreferredColorSchemeProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  const activeHandlers = useApplyActiveProperties(collection, properties)
  writeCollection(collection, 'aspectRatio', properties.svgWidth / properties.svgHeight)
  finalizeCollection(collection)

  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)

  useSignalEffect(() => {
    const aspectRatio = properties.svgWidth / properties.svgHeight
    const [offsetX, offsetY, scale] = fitNormalizedContentInside(
      node.size,
      node.paddingInset,
      node.borderInset,
      node.pixelSize,
      properties.svgWidth / properties.svgHeight,
    )
    svgGroup.position.set(offsetX - (scale * aspectRatio) / 2, offsetY + scale / 2, 0)
    svgGroup.scale.setScalar(scale / properties.svgHeight)
    svgGroup.updateMatrix()
  }, [node, svgGroup, properties.svgWidth, properties.svgHeight])

  useSignalEffect(() => void (svgGroup.visible = !isClipped.value), [])

  const interactionPanel = useInteractionPanel(node.size, node, backgroundOrderInfo, rootGroupRef)

  useComponentInternals(ref, node, interactionPanel)

  return (
    <InteractionGroup
      groupRef={groupRef}
      matrix={transformMatrix}
      handlers={properties}
      hoverHandlers={hoverHandlers}
      activeHandlers={activeHandlers}
    >
      <primitive object={interactionPanel} />
      <primitive object={svgGroup} />
    </InteractionGroup>
  )
})
