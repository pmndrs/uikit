import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { YogaProperties } from '../flex/node.js'
import { useApplyHoverProperties } from '../hover.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { InteractionGroup, MaterialClass, useInstancedPanel, useInteractionPanel } from '../panel/react.js'
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from '../properties/alias.js'
import { WithClasses, useApplyProperties } from '../properties/default.js'
import { WithReactive, createCollection, finalizeCollection, writeCollection } from '../properties/utils.js'
import { ScrollListeners } from '../scroll.js'
import { TransformProperties, useTransformMatrix } from '../transform.js'
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
import { forwardRef, useRef } from 'react'
import { useParentClippingRect, useIsClipped } from '../clipping.js'
import { useFlexNode } from '../flex/react.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { InstancedTextProperties, useInstancedText } from '../text/react.js'
import { ReadonlySignal } from '@preact/signals-core'
import { useRootGroupRef } from '../utils.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { Group } from 'three'
import { ElementType, ZIndexOffset, useOrderInfo } from '../order.js'
import { useApplyPreferredColorSchemeProperties } from '../dark.js'

export type TextProperties = WithConditionals<
  WithClasses<
    WithAllAliases<WithReactive<YogaProperties & PanelProperties & TransformProperties & InstancedTextProperties>>
  >
>

export const Text = forwardRef<
  ComponentInternals,
  {
    children: string | ReadonlySignal<string> | Array<string | ReadonlySignal<string>>
    backgroundMaterialClass?: MaterialClass
    zIndexOffset?: ZIndexOffset
  } & TextProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners &
    ScrollListeners
>((properties, ref) => {
  const collection = createCollection()
  const groupRef = useRef<Group>(null)
  const node = useFlexNode(groupRef)
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  const transformMatrix = useTransformMatrix(collection, node)
  const rootGroupRef = useRootGroupRef()
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
  const orderInfo = useOrderInfo(ElementType.Text, undefined, backgroundOrderInfo)
  const measureFunc = useInstancedText(
    collection,
    properties.children,
    globalMatrix,
    node,
    isClipped,
    parentClippingRect,
    orderInfo,
  )

  useApplyProperties(collection, properties)
  useApplyPreferredColorSchemeProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  writeCollection(collection, 'measureFunc', measureFunc)
  finalizeCollection(collection)

  const interactionPanel = useInteractionPanel(node.size, node, backgroundOrderInfo, rootGroupRef)

  useComponentInternals(ref, node, interactionPanel)

  return (
    <InteractionGroup groupRef={groupRef} matrix={transformMatrix} handlers={properties} hoverHandlers={hoverHandlers}>
      <primitive object={interactionPanel} />
    </InteractionGroup>
  )
})
