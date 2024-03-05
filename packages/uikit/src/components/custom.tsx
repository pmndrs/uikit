import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { forwardRef, ReactNode, useEffect, useRef } from 'react'
import { YogaProperties } from '../flex/node.js'
import { useFlexNode, FlexProvider } from '../flex/react.js'
import { useApplyHoverProperties } from '../hover.js'
import { InteractionGroup, ShadowProperties } from '../panel/react.js'
import { createCollection, finalizeCollection, WithReactive } from '../properties/utils.js'
import { useRootGroupRef } from '../utils.js'
import { FrontSide, Group, Material, Mesh } from 'three'
import {
  ComponentInternals,
  LayoutListeners,
  useComponentInternals,
  useGlobalMatrix,
  useLayoutListeners,
  useViewportListeners,
  ViewportListeners,
  WithConditionals,
} from './utils.js'
import { panelGeometry } from '../panel/utils.js'
import { useGlobalClippingPlanes, useIsClipped, useParentClippingRect } from '../clipping.js'
import { makeClippedRaycast } from '../panel/interaction-panel-mesh.js'
import { flexAliasPropertyTransformation, WithAllAliases } from '../properties/alias.js'
import { TransformProperties, useTransformMatrix } from '../transform.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { useApplyProperties, WithClasses } from '../properties/default.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { ElementType, setupRenderOrder, useOrderInfo, ZIndexOffset } from '../order.js'
import { effect } from '@preact/signals-core'
import { useApplyPreferredColorSchemeProperties } from '../dark.js'
import { useApplyActiveProperties } from '../active.js'

export type CustomContainerProperties = WithConditionals<
  WithClasses<WithAllAliases<WithReactive<YogaProperties & TransformProperties>>>
>

export const CustomContainer = forwardRef<
  ComponentInternals,
  {
    children?: ReactNode
    zIndexOffset?: ZIndexOffset
    customDepthMaterial?: Material
    customDistanceMaterial?: Material
  } & CustomContainerProperties &
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

  const parentClippingRect = useParentClippingRect()
  const rootGroupRef = useRootGroupRef()
  const clippingPlanes = useGlobalClippingPlanes(parentClippingRect, rootGroupRef)

  const orderInfo = useOrderInfo(ElementType.Custom, properties.zIndexOffset, undefined)

  const meshRef = useRef<Mesh>(null)

  const globalMatrix = useGlobalMatrix(transformMatrix)
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)

  useEffect(() => {
    const mesh = meshRef.current
    if (mesh == null) {
      return
    }

    mesh.raycast = makeClippedRaycast(mesh, mesh.raycast, rootGroupRef, parentClippingRect, orderInfo)
    setupRenderOrder(mesh, node.cameraDistance, orderInfo)

    if (mesh.material instanceof Material) {
      mesh.material.clippingPlanes = clippingPlanes
      mesh.material.needsUpdate = true
      mesh.material.shadowSide = FrontSide
    }

    const unsubscribeScale = effect(() => {
      const [width, height] = node.size.value
      mesh.scale.set(width * node.pixelSize, height * node.pixelSize, 1)
      mesh.updateMatrix()
    })

    const unsubscribeVisibile = effect(() => void (mesh.visible = !isClipped.value))

    return () => {
      unsubscribeScale()
      unsubscribeVisibile()
    }
  }, [clippingPlanes, node, isClipped, parentClippingRect, orderInfo, rootGroupRef])

  //apply all properties
  useApplyProperties(collection, properties)
  useApplyPreferredColorSchemeProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  const activeHandlers = useApplyActiveProperties(collection, properties)
  finalizeCollection(collection)

  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)

  useComponentInternals(ref, node, meshRef)

  return (
    <InteractionGroup
      groupRef={groupRef}
      matrix={transformMatrix}
      handlers={properties}
      hoverHandlers={hoverHandlers}
      activeHandlers={activeHandlers}
    >
      <mesh
        receiveShadow={properties.receiveShadow}
        castShadow={properties.castShadow}
        customDepthMaterial={properties.customDepthMaterial}
        customDistanceMaterial={properties.customDistanceMaterial}
        ref={meshRef}
        matrixAutoUpdate={false}
        geometry={panelGeometry}
      >
        <FlexProvider value={undefined as any}>{properties.children}</FlexProvider>
      </mesh>
    </InteractionGroup>
  )
})
