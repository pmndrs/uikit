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
import { forwardRef } from 'react'
import { useParentClippingRect, useIsClipped } from '../clipping.js'
import { useFlexNode } from '../flex/react.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { InstancedTextProperties, useInstancedText } from '../text/react.js'
import { Signal } from '@preact/signals-core'
import { useRootGroup } from '../utils.js'
import { useApplyResponsiveProperties } from '../responsive.js'

export type TextProperties = WithConditionals<
  WithClasses<
    WithAllAliases<WithReactive<YogaProperties & PanelProperties & TransformProperties & InstancedTextProperties>>
  >
>

export const Text = forwardRef<
  ComponentInternals,
  {
    children: string | Signal<string>
    index?: number
    backgroundMaterialClass?: MaterialClass
  } & TextProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners &
    ScrollListeners
>((properties, ref) => {
  const collection = createCollection()
  const node = useFlexNode(properties.index)
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  const transformMatrix = useTransformMatrix(collection, node)
  const rootGroup = useRootGroup()
  const globalMatrix = useGlobalMatrix(transformMatrix)
  const parentClippingRect = useParentClippingRect()
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)
  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)
  useInstancedPanel(
    collection,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    isClipped,
    node.depth,
    parentClippingRect,
    properties.backgroundMaterialClass,
    panelAliasPropertyTransformation,
  )
  const measureFunc = useInstancedText(
    collection,
    properties.children,
    globalMatrix,
    node,
    isClipped,
    parentClippingRect,
  )

  useApplyProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  writeCollection(collection, 'measureFunc', measureFunc)
  finalizeCollection(collection)

  const interactionPanel = useInteractionPanel(node.size, node, rootGroup)

  useComponentInternals(ref, node, interactionPanel)

  return (
    <InteractionGroup matrix={transformMatrix} handlers={properties} hoverHandlers={hoverHandlers}>
      <primitive object={interactionPanel} />
    </InteractionGroup>
  )
})
