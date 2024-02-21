import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { forwardRef, ReactNode, useEffect, useMemo, useRef } from 'react'
import { YogaProperties } from '../flex/node.js'
import { useFlexNode, FlexProvider } from '../flex/react.js'
import { useApplyHoverProperties } from '../hover.js'
import { InteractionGroup } from '../panel/react.js'
import { createCollection, finalizeCollection, WithReactive } from '../properties/utils.js'
import { useRootGroupRef, useSignalEffect } from '../utils.js'
import { Group, Material, Mesh } from 'three'
import {
  ComponentInternals,
  LayoutListeners,
  setupRenderingOrder,
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

export type CustomContainerProperties = WithConditionals<
  WithClasses<WithAllAliases<WithReactive<YogaProperties & TransformProperties>>>
>

export const CustomContainer = forwardRef<
  ComponentInternals,
  {
    children?: ReactNode
  } & CustomContainerProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners
>((properties, ref) => {
  const collection = createCollection()
  const groupRef = useRef<Group>(null)
  const node = useFlexNode(groupRef)
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  const transformMatrix = useTransformMatrix(collection, node)

  const parentClippingRect = useParentClippingRect()
  const rootGroupRef = useRootGroupRef()
  const clippingPlanes = useGlobalClippingPlanes(parentClippingRect, rootGroupRef)

  const mesh = useMemo(() => {
    const result = new Mesh(panelGeometry)
    result.matrixAutoUpdate = false
    result.raycast = makeClippedRaycast(result, result.raycast, rootGroupRef, parentClippingRect)
    result.position.z = 0.01
    result.updateMatrix()
    setupRenderingOrder(result, node.cameraDistance, 'Custom')
    return result
  }, [node, parentClippingRect, rootGroupRef])

  useSignalEffect(() => {
    const [width, height] = node.size.value
    mesh.scale.set(width * node.pixelSize, height * node.pixelSize, 1)
    mesh.updateMatrix()
  }, [mesh])

  useEffect(() => {
    if (!(mesh.material instanceof Material)) {
      return
    }
    mesh.material.clippingPlanes = clippingPlanes
    mesh.material.needsUpdate = true
  }, [mesh, clippingPlanes])

  const globalMatrix = useGlobalMatrix(transformMatrix)
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)
  useSignalEffect(() => void (mesh.visible = !isClipped.value), [mesh, isClipped])

  //apply all properties
  useApplyProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  finalizeCollection(collection)

  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)

  useComponentInternals(ref, node, mesh)

  return (
    <InteractionGroup groupRef={groupRef} matrix={transformMatrix} handlers={properties} hoverHandlers={hoverHandlers}>
      <primitive object={mesh} />
      <FlexProvider value={undefined as any}>{properties.children}</FlexProvider>
    </InteractionGroup>
  )
})
