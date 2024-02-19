import { ReactNode, forwardRef } from "react";
import { useFlexNode, FlexProvider } from "../flex/react.js";
import { WithReactive, createCollection, finalizeCollection } from "../properties/utils.js";
import {
  InteractionGroup,
  MaterialClass,
  useInstancedPanel,
  useInteractionPanel,
} from "../panel/react.js";
import { EventHandlers } from "@react-three/fiber/dist/declarations/src/core/events.js";
import { YogaProperties } from "../flex/node.js";
import { useApplyHoverProperties } from "../hover.js";
import {
  ClippingRectProvider,
  useClippingRect,
  useIsClipped,
  useParentClippingRect,
} from "../clipping.js";
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
} from "./utils.js";
import {
  ScrollGroup,
  ScrollHandler,
  ScrollListeners,
  ScrollbarProperties,
  useGlobalScrollMatrix,
  useScrollPosition,
  useScrollbars,
} from "../scroll.js";
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from "../properties/alias.js";
import { PanelProperties } from "../panel/instanced-panel.js";
import { TransformProperties, useTransformMatrix } from "../transform.js";
import { useImmediateProperties } from "../properties/immediate.js";
import { WithClasses, useApplyProperties } from "../properties/default.js";
import { useRootGroup } from "../utils.js";
import { useApplyResponsiveProperties } from "../responsive.js";

export type ContainerProperties = WithConditionals<
  WithClasses<
    WithAllAliases<
      WithReactive<YogaProperties & PanelProperties & TransformProperties> & ScrollbarProperties
    >
  >
>;

export const Container = forwardRef<
  ComponentInternals,
  {
    children?: ReactNode;
    index?: number;
    zIndexOffset?: number;
    backgroundMaterialClass?: MaterialClass;
  } & ContainerProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners &
    ScrollListeners
>((properties, ref) => {
  const collection = createCollection();
  const node = useFlexNode(properties.index);
  useImmediateProperties(collection, node, flexAliasPropertyTransformation);
  const transformMatrix = useTransformMatrix(collection, node);
  const parentClippingRect = useParentClippingRect();
  const globalMatrix = useGlobalMatrix(transformMatrix);
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node);
  useInstancedPanel(
    collection,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    isClipped,
    node.depth + (properties.zIndexOffset ?? 0),
    parentClippingRect,
    properties.backgroundMaterialClass,
    panelAliasPropertyTransformation,
  );

  const scrollPosition = useScrollPosition();
  const globalScrollMatrix = useGlobalScrollMatrix(scrollPosition, node, globalMatrix);
  useScrollbars(
    collection,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    properties.scrollbarMaterialClass,
    parentClippingRect,
  );

  //apply all properties
  useApplyProperties(collection, properties);
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties);
  finalizeCollection(collection);

  useLayoutListeners(properties, node.size);
  useViewportListeners(properties, isClipped);

  const clippingRect = useClippingRect(
    globalMatrix,
    node.size,
    node.borderInset,
    node.overflow,
    node,
    parentClippingRect,
  );

  const rootGroup = useRootGroup();

  const interactionPanel = useInteractionPanel(node.size, node, rootGroup);

  useComponentInternals(ref, node, interactionPanel, scrollPosition);

  return (
    <InteractionGroup matrix={transformMatrix} handlers={properties} hoverHandlers={hoverHandlers}>
      <ScrollHandler listeners={properties} node={node} scrollPosition={scrollPosition}>
        <primitive object={interactionPanel} />
      </ScrollHandler>
      <ScrollGroup node={node} scrollPosition={scrollPosition}>
        <MatrixProvider value={globalScrollMatrix}>
          <FlexProvider value={node}>
            <ClippingRectProvider value={clippingRect}>{properties.children}</ClippingRectProvider>
          </FlexProvider>
        </MatrixProvider>
      </ScrollGroup>
    </InteractionGroup>
  );
});
