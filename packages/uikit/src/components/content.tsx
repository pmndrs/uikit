import { EventHandlers } from "@react-three/fiber/dist/declarations/src/core/events.js";
import {
  ReactNode,
  RefObject,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { MeasuredFlexNode, YogaProperties } from "../flex/node.js";
import { FlexProvider, useFlexNode } from "../flex/react.js";
import {
  InteractionGroup,
  InteractionPanel,
  MaterialClass,
  useInstancedPanel,
} from "../panel/react.js";
import {
  ManagerCollection,
  PropertyManager,
  WithReactive,
  createCollection,
  finalizeCollection,
  useGetBatchedProperties,
  writeCollection,
} from "../properties/utils.js";
import {
  alignmentZMap,
  fitNormalizedContentInside,
  useRootGroup,
  useSignalEffect,
} from "../utils.js";
import { Box3, Group, Mesh, Vector3 } from "three";
import { effect, Signal, signal } from "@preact/signals-core";
import { WithHover, useApplyHoverProperties } from "../hover.js";
import {
  LayoutListeners,
  ViewportListeners,
  setRootIdentifier,
  useGlobalMatrix,
  useLayoutListeners,
  useViewportListeners,
} from "./utils.js";
import {
  ClippingRect,
  useGlobalClippingPlanes,
  useIsClipped,
  useParentClippingRect,
} from "../clipping.js";
import { makeClippedRaycast } from "../panel/interaction-panel-mesh.js";
import { PanelProperties } from "../panel/instanced-panel.js";
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from "../properties/alias.js";
import { TransformProperties, useTransformMatrix } from "../transform.js";
import { useImmediateProperties } from "../properties/immediate.js";
import { WithClasses, useApplyProperties } from "../properties/default.js";

export type ContentProperties = WithHover<
  WithClasses<
    WithAllAliases<
      WithReactive<YogaProperties & PanelProperties & TransformProperties & DepthAlignProperties>
    >
  >
>;

export type DepthAlignProperties = {
  depthAlign?: keyof typeof alignmentZMap;
};

export const Content = forwardRef<
  MeasuredFlexNode,
  {
    children?: ReactNode;
    index?: number;
    backgroundMaterialClass?: MaterialClass;
  } & ContentProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners
>((properties, ref) => {
  const collection = createCollection();
  const node = useFlexNode(properties.index);
  useImmediateProperties(collection, node, flexAliasPropertyTransformation);
  useImperativeHandle(ref, () => node, [node]);
  const transformMatrix = useTransformMatrix(collection, node);
  const globalMatrix = useGlobalMatrix(transformMatrix);
  const parentClippingRect = useParentClippingRect();
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node);
  useLayoutListeners(properties, node.size);
  useViewportListeners(properties, isClipped);
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
  );
  const innerGroupRef = useRef<Group>(null);
  const aspectRatio = useNormalizedContent(
    collection,
    innerGroupRef,
    node.rootIdentifier,
    parentClippingRect,
  );

  //apply all properties
  useApplyProperties(collection, properties);
  const hoverHandlers = useApplyHoverProperties(collection, properties);
  writeCollection(collection, "aspectRatio", aspectRatio);
  finalizeCollection(collection);

  const outerGroup = useMemo(() => {
    const group = new Group();
    group.matrixAutoUpdate = false;
    return group;
  }, []);
  useSignalEffect(() => {
    const [offsetX, offsetY, scale] = fitNormalizedContentInside(
      node.size,
      node.paddingInset,
      node.borderInset,
      node.pixelSize,
      aspectRatio.value ?? 1,
    );
    outerGroup.position.set(offsetX, offsetY, 0);
    outerGroup.scale.setScalar(scale);
    outerGroup.updateMatrix();
  }, [node, aspectRatio]);

  const rootGroup = useRootGroup();

  return (
    <InteractionGroup matrix={transformMatrix} handlers={properties} hoverHandlers={hoverHandlers}>
      <InteractionPanel rootGroup={rootGroup} psRef={node} size={node.size} />
      <primitive object={outerGroup}>
        <group ref={innerGroupRef} matrixAutoUpdate={false}>
          <FlexProvider value={undefined as any}>{properties.children}</FlexProvider>
        </group>
      </primitive>
    </InteractionGroup>
  );
});

const box3Helper = new Box3();

const propertyKeys = ["depthAlign"] as const;

/**
 * normalizes the content so it has a height of 1
 */
function useNormalizedContent(
  collection: ManagerCollection,
  ref: RefObject<Group>,
  rootIdentifier: unknown,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
): Signal<number | undefined> {
  const aspectRatio = useMemo(() => signal<number | undefined>(undefined), []);
  const rootGroup = useRootGroup();
  const clippingPlanes = useGlobalClippingPlanes(parentClippingRect, rootGroup);
  const getPropertySignal = useGetBatchedProperties<DepthAlignProperties>(collection, propertyKeys);
  useEffect(() => {
    const group = ref.current;
    if (group == null) {
      return;
    }
    group.traverse((object) => {
      if (object instanceof Mesh) {
        setRootIdentifier(object, rootIdentifier, "Object");
        object.material.clippingPlanes = clippingPlanes;
        object.material.needsUpdate = true;
        object.raycast = makeClippedRaycast(object, object.raycast, rootGroup, parentClippingRect);
      }
    });
    const parent = group.parent;
    parent?.remove(group);
    box3Helper.setFromObject(group);
    const vector = new Vector3();
    box3Helper.getSize(vector);
    const scale = 1 / vector.y;
    const depth = vector.z;
    aspectRatio.value = vector.x / vector.y;
    group.scale.set(1, 1, 1).multiplyScalar(scale);
    if (parent != null) {
      parent.add(group);
    }
    box3Helper.getCenter(vector);
    return effect(() => {
      group.position.copy(vector).negate();
      group.position.z -= alignmentZMap[getPropertySignal.value("depthAlign") ?? "back"] * depth;
      group.position.multiplyScalar(scale);
      group.updateMatrix();
    });
  }, [getPropertySignal, rootIdentifier, clippingPlanes, rootGroup]);

  return aspectRatio;
}
