import { ReactNode, forwardRef, useRef } from 'react'
import { useFlexNode, FlexProvider } from './react.js'
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
import { applyHoverProperties } from '../hover.js'
import { ClippingRectProvider, computeClippingRect, useIsClipped, useParentClippingRect } from '../clipping.js'
import {
  ViewportListeners,
  LayoutListeners,
  useViewportListeners,
  useLayoutListeners,
  useGlobalMatrix,
  MatrixProvider,
  ComponentInternals,
  useComponentInternals,
  WithConditionals,
} from './utils.js'
import {
  ScrollGroup,
  ScrollHandler,
  ScrollListeners,
  ScrollbarProperties,
  useGlobalScrollMatrix,
  useScrollPosition,
  createScrollbars,
} from '../scroll.js'
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from '../properties/alias.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { TransformProperties, useTransformMatrix } from '../transform.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { WithClasses, addToMerged } from '../properties/default.js'
import { useRootGroupRef } from '../utils.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { Group } from 'three'
import { ElementType, OrderInfoProvider, ZIndexOffset, useOrderInfo } from '../order.js'
import { applyPreferredColorSchemeProperties } from '../dark.js'
import { applyActiveProperties } from '../active.js'

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
  const globalScrollMatrix = useGlobalScrollMatrix(scrollPosition, node, globalMatrix)
  createScrollbars(
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
  addToMerged(collection, properties)
  applyPreferredColorSchemeProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = applyHoverProperties(collection, properties)
  const activeHandlers = applyActiveProperties(collection, properties)
  finalizeCollection(collection)

  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)

  const clippingRect = computeClippingRect(
    globalMatrix,
    node.size,
    node.borderInset,
    node.overflow,
    node,
    parentClippingRect,
  )

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
      <ScrollGroup node={node} scrollPosition={scrollPosition}>
        <MatrixProvider value={globalScrollMatrix}>
          <FlexProvider value={node}>
            <ClippingRectProvider value={clippingRect}>
              <OrderInfoProvider value={orderInfo}>{properties.children}</OrderInfoProvider>
            </ClippingRectProvider>
          </FlexProvider>
        </MatrixProvider>
      </ScrollGroup>
    </InteractionGroup>
  )
})
