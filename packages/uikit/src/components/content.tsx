import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { ReactNode, RefObject, forwardRef, useEffect, useMemo, useRef } from 'react'
import { YogaProperties } from '../flex/node.js'
import { FlexProvider, useFlexNode } from '../flex/react.js'
import { InteractionGroup, MaterialClass, useInstancedPanel, useInteractionPanel } from '../panel/react.js'
import {
  ManagerCollection,
  WithReactive,
  createCollection,
  finalizeCollection,
  useGetBatchedProperties,
  writeCollection,
} from '../properties/utils.js'
import { alignmentZMap, fitNormalizedContentInside, useRootGroupRef, useSignalEffect } from '../utils.js'
import { Box3, Group, Mesh, Vector3 } from 'three'
import { computed, effect, Signal, signal } from '@preact/signals-core'
import { useApplyHoverProperties } from '../hover.js'
import {
  ComponentInternals,
  LayoutListeners,
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

export type ContentProperties = WithConditionals<
  WithClasses<
    WithAllAliases<WithReactive<YogaProperties & PanelProperties & TransformProperties & DepthAlignProperties>>
  >
>

export type DepthAlignProperties = {
  depthAlign?: keyof typeof alignmentZMap
}

export const Content = forwardRef<
  ComponentInternals,
  {
    children?: ReactNode
    zIndexOffset?: ZIndexOffset
    backgroundMaterialClass?: MaterialClass
    keepAspectRatio?: boolean
  } & ContentProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners
>((properties, ref) => {
  const collection = createCollection()
  const groupRef = useRef<Group>(null)
  const node = useFlexNode(groupRef)
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  const transformMatrix = useTransformMatrix(collection, node)
  const globalMatrix = useGlobalMatrix(transformMatrix)
  const parentClippingRect = useParentClippingRect()
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)
  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)
  const backgroundOrderInfo = useOrderInfo(ElementType.Panel, properties.zIndexOffset)
  useInstancedPanel(
    collection,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    isClipped,
    backgroundOrderInfo,
    parentClippingRect,
    properties.backgroundMaterialClass,
    panelAliasPropertyTransformation,
  )
  const innerGroupRef = useRef<Group>(null)
  const rootGroupRef = useRootGroupRef()
  const orderInfo = useOrderInfo(ElementType.Object, undefined, backgroundOrderInfo)
  const size = useNormalizedContent(
    collection,
    innerGroupRef,
    rootGroupRef,
    node.cameraDistance,
    parentClippingRect,
    orderInfo,
  )

  //apply all properties
  useApplyProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  const aspectRatio = useMemo(
    () =>
      computed(() => {
        const [x, y] = size.value
        return x / y
      }),
    [size],
  )
  if ((properties.keepAspectRatio ?? true) === true) {
    writeCollection(collection, 'aspectRatio', aspectRatio)
  }
  finalizeCollection(collection)

  const outerGroupRef = useRef<Group>(null)
  useEffect(
    () =>
      effect(() => {
        const [width, height] = node.size.value
        const [pTop, pRight, pBottom, pLeft] = node.paddingInset.value
        const [bTop, bRight, bBottom, bLeft] = node.borderInset.value
        const topInset = pTop + bTop
        const rightInset = pRight + bRight
        const bottomInset = pBottom + bBottom
        const leftInset = pLeft + bLeft

        const innerWidth = width - leftInset - rightInset
        const innerHeight = height - topInset - bottomInset

        const { pixelSize } = node

        const { current } = outerGroupRef
        current?.position.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0)
        const [, y, z] = size.value
        current?.scale.set(
          innerWidth * pixelSize,
          innerHeight * pixelSize,
          properties.keepAspectRatio ? (innerHeight * pixelSize * z) / y : z,
        )
        current?.updateMatrix()
      }),
    [node, properties.keepAspectRatio, size],
  )

  const interactionPanel = useInteractionPanel(node.size, node, backgroundOrderInfo, rootGroupRef)

  useComponentInternals(ref, node, interactionPanel)

  return (
    <InteractionGroup groupRef={groupRef} matrix={transformMatrix} handlers={properties} hoverHandlers={hoverHandlers}>
      <primitive object={interactionPanel} />
      <group matrixAutoUpdate={false} ref={outerGroupRef}>
        <group ref={innerGroupRef} matrixAutoUpdate={false}>
          <FlexProvider value={undefined as any}>{properties.children}</FlexProvider>
        </group>
      </group>
    </InteractionGroup>
  )
})

const box3Helper = new Box3()

const propertyKeys = ['depthAlign'] as const

/**
 * normalizes the content so it has a height of 1
 */
function useNormalizedContent(
  collection: ManagerCollection,
  ref: RefObject<Group>,
  rootGroupRef: RefObject<Group>,
  rootCameraDistance: CameraDistanceRef,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: OrderInfo,
): Signal<Vector3> {
  const sizeSignal = useMemo(() => signal<Vector3>(new Vector3(1, 1, 1)), [])
  const clippingPlanes = useGlobalClippingPlanes(parentClippingRect, rootGroupRef)
  const getPropertySignal = useGetBatchedProperties<DepthAlignProperties>(collection, propertyKeys)
  useEffect(() => {
    const group = ref.current
    if (group == null) {
      return
    }
    group.traverse((object) => {
      if (object instanceof Mesh) {
        setupRenderOrder(object, rootCameraDistance, orderInfo)
        object.material.clippingPlanes = clippingPlanes
        object.material.needsUpdate = true
        object.raycast = makeClippedRaycast(object, object.raycast, rootGroupRef, parentClippingRect, orderInfo)
      }
    })
    const parent = group.parent
    parent?.remove(group)
    box3Helper.setFromObject(group)
    const size = new Vector3()
    const center = new Vector3()
    box3Helper.getSize(size)
    const depth = size.z
    sizeSignal.value = size
    group.scale.set(1, 1, 1).divide(size)
    if (parent != null) {
      parent.add(group)
    }
    box3Helper.getCenter(center)
    return effect(() => {
      group.position.copy(center).negate()
      group.position.z -= alignmentZMap[getPropertySignal.value('depthAlign') ?? 'back'] * depth
      group.position.divide(size)
      group.updateMatrix()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPropertySignal, rootCameraDistance, clippingPlanes, rootGroupRef])

  return sizeSignal
}
