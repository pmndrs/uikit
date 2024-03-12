import { ReactNode, forwardRef, useRef } from 'react'
import { useFlexNode } from '../flex/react.js'
import { WithReactive, createCollection, finalizeCollection } from '../properties/utils.js'
import {
  InteractionGroup,
  MaterialClass,
  ShadowProperties,
  useInstancedPanel,
  useInteractionPanel,
  usePanelGroupDependencies,
} from '../panel/react.js'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { YogaProperties } from '../flex/node.js'
import { useApplyHoverProperties } from '../hover.js'
import { useIsClipped, useParentClippingRect } from '../clipping.js'
import {
  ViewportListeners,
  LayoutListeners,
  useViewportListeners,
  useLayoutListeners,
  useGlobalMatrix,
  ComponentInternals,
  useComponentInternals,
  WithConditionals,
  ChildrenProvider,
} from './utils.js'
import { ScrollHandler, ScrollListeners, ScrollbarProperties, useScrollPosition, useScrollbars } from '../scroll.js'
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from '../properties/alias.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { TransformProperties, useTransformMatrix } from '../transform.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { WithClasses, useApplyProperties } from '../properties/default.js'
import { useRootGroupRef } from '../utils.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { Group } from 'three'
import { ElementType, ZIndexOffset, useOrderInfo } from '../order.js'
import { useApplyPreferredColorSchemeProperties } from '../dark.js'
import { useApplyActiveProperties } from '../active.js'

export type ContainerProperties = WithConditionals<
  WithClasses<
    WithAllAliases<WithReactive<YogaProperties & PanelProperties & TransformProperties> & ScrollbarProperties>
  >
>

export const Container = forwardRef<
  ComponentInternals,
  {
    children?: ReactNode
    zIndexOffset?: ZIndexOffset
    panelMaterialClass?: MaterialClass
  } & ContainerProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners &
    ScrollListeners &
    ShadowProperties
>((properties, ref) => {
  const collection = createCollection()
  const groupRef = useRef<Group>(null)
  const node = useFlexNode(groupRef)
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  const transformMatrix = useTransformMatrix(collection, node)
  const parentClippingRect = useParentClippingRect()
  const globalMatrix = useGlobalMatrix(transformMatrix)
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)
  const groupDeps = usePanelGroupDependencies(properties.panelMaterialClass, properties)
  const orderInfo = useOrderInfo(ElementType.Panel, properties.zIndexOffset, groupDeps)
  useInstancedPanel(
    collection,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    isClipped,
    orderInfo,
    parentClippingRect,
    groupDeps,
    panelAliasPropertyTransformation,
  )

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
  finalizeCollection(collection)

  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)

  const rootGroupRef = useRootGroupRef()

  const interactionPanel = useInteractionPanel(node.size, node, orderInfo, rootGroupRef)

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
      </ScrollHandler>
      <ChildrenProvider globalMatrix={globalMatrix} node={node} orderInfo={orderInfo} scrollPosition={scrollPosition}>
        {properties.children}
      </ChildrenProvider>
    </InteractionGroup>
  )
})
