import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { YogaProperties } from '../flex/node.js'
import { applyHoverProperties } from '../hover.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import {
  InteractionGroup,
  MaterialClass,
  ShadowProperties,
  useInstancedPanel,
  useInteractionPanel,
  usePanelGroupDependencies,
} from '../panel/react.js'
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from '../properties/alias.js'
import { WithClasses, addToMerged } from '../properties/default.js'
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
import { useFlexNode } from './react.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { InstancedTextProperties, useInstancedText } from '../text/react.js'
import { ReadonlySignal } from '@preact/signals-core'
import { useRootGroupRef } from '../utils.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { Group } from 'three'
import { ElementType, ZIndexOffset, useOrderInfo } from '../order.js'
import { applyPreferredColorSchemeProperties } from '../dark.js'
import { applyActiveProperties } from '../active.js'

export type TextProperties = WithConditionals<
  WithClasses<
    WithAllAliases<WithReactive<YogaProperties & PanelProperties & TransformProperties & InstancedTextProperties>>
  >
>

export const Text = forwardRef<
  ComponentInternals,
  {
    children: string | ReadonlySignal<string> | Array<string | ReadonlySignal<string>>
    panelMaterialClass?: MaterialClass
    zIndexOffset?: ZIndexOffset
  } & TextProperties &
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
  const rootGroupRef = useRootGroupRef()
  const globalMatrix = useGlobalMatrix(transformMatrix)
  const parentClippingRect = useParentClippingRect()
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)
  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)
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
  const orderInfo = useOrderInfo(ElementType.Text, undefined, undefined, backgroundOrderInfo)
  const measureFunc = useInstancedText(
    collection,
    properties.children,
    globalMatrix,
    node,
    isClipped,
    parentClippingRect,
    orderInfo,
  )

  addToMerged(collection, properties)
  applyPreferredColorSchemeProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = applyHoverProperties(collection, properties)
  const activeHandlers = applyActiveProperties(collection, properties)
  writeCollection(collection, 'measureFunc', measureFunc)
  finalizeCollection(collection)

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
    </InteractionGroup>
  )
})
