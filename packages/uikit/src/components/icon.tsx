import { EventHandlers } from "@react-three/fiber/dist/declarations/src/core/events.js";
import { ReactNode, forwardRef, useImperativeHandle, useMemo } from "react";
import { MeasuredFlexNode } from "../flex/node.js";
import { useFlexNode } from "../flex/react.js";
import {
  InteractionGroup,
  InteractionPanel,
  MaterialClass,
  useInstancedPanel,
} from "../panel/react.js";
import {
  createCollection,
  finalizeCollection,
  useGetBatchedProperties,
  writeCollection,
} from "../properties/utils.js";
import { useSignalEffect, fitNormalizedContentInside, useRootGroup } from "../utils.js";
import { Color, Group, Mesh, MeshBasicMaterial, ShapeGeometry } from "three";
import { useApplyHoverProperties } from "../hover.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import {
  LayoutListeners,
  ViewportListeners,
  setRootIdentifier,
  useGlobalMatrix,
  useLayoutListeners,
  useViewportListeners,
} from "./utils.js";
import { useGlobalClippingPlanes, useIsClipped, useParentClippingRect } from "../clipping.js";
import { makeClippedRaycast } from "../panel/interaction-panel-mesh.js";
import {
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from "../properties/alias.js";
import { useTransformMatrix } from "../transform.js";
import { useImmediateProperties } from "../properties/immediate.js";
import { useApplyProperties } from "../properties/default.js";
import { SvgProperties, AppearanceProperties } from "./svg.js";

const colorHelper = new Color();

const propertyKeys = ["color", "opacity"] as const;

const loader = new SVGLoader();

export const SvgIconFromText = forwardRef<
  MeasuredFlexNode,
  {
    children?: ReactNode;
    index?: number;
    text: string;
    svgWidth: number;
    svgHeight: number;
    materialClass?: MaterialClass;
    backgroundMaterialClass?: MaterialClass;
  } & SvgProperties &
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

  const rootGroup = useRootGroup();
  const clippingPlanes = useGlobalClippingPlanes(parentClippingRect, rootGroup);

  const svgGroup = useMemo(() => {
    const group = new Group();
    group.matrixAutoUpdate = false;
    const result = loader.parse(properties.text);

    for (const path of result.paths) {
      const shapes = SVGLoader.createShapes(path);
      const material = new (properties.materialClass ?? MeshBasicMaterial)();
      material.transparent = true;
      material.depthWrite = false;
      material.toneMapped = false;
      material.clippingPlanes = clippingPlanes;

      for (const shape of shapes) {
        const geometry = new ShapeGeometry(shape);
        geometry.computeBoundingBox();
        const mesh = new Mesh(geometry, material);
        mesh.matrixAutoUpdate = false;
        mesh.raycast = makeClippedRaycast(mesh, mesh.raycast, rootGroup, parentClippingRect);
        setRootIdentifier(mesh, node.rootIdentifier, "Svg");
        mesh.userData.color = path.color;
        mesh.scale.y = -1;
        mesh.updateMatrix();
        group.add(mesh);
      }
    }

    return group;
  }, [node, parentClippingRect, properties.text, properties.materialClass]);

  const getPropertySignal = useGetBatchedProperties<AppearanceProperties>(collection, propertyKeys);
  useSignalEffect(() => {
    const colorRepresentation = getPropertySignal.value("color");
    const opacity = getPropertySignal.value("opacity");
    let color: Color | undefined;
    if (Array.isArray(colorRepresentation)) {
      color = colorHelper.setRGB(...colorRepresentation);
    } else if (colorRepresentation != null) {
      color = colorHelper.set(colorRepresentation);
    }
    svgGroup.traverse((object) => {
      if (!(object instanceof Mesh)) {
        return;
      }
      const material: MeshBasicMaterial = object.material;
      material.color.copy(color ?? object.userData.color);
      material.opacity = opacity ?? 1;
    });
  }, [svgGroup, properties.color]);

  //apply all properties
  writeCollection(collection, "width", properties.svgWidth);
  writeCollection(collection, "height", properties.svgHeight);
  useApplyProperties(collection, properties);
  const hoverHandlers = useApplyHoverProperties(collection, properties);
  writeCollection(collection, "aspectRatio", properties.svgWidth / properties.svgHeight);
  finalizeCollection(collection);

  useLayoutListeners(properties, node.size);
  useViewportListeners(properties, isClipped);

  useSignalEffect(() => {
    const aspectRatio = properties.svgWidth / properties.svgHeight
    const [offsetX, offsetY, scale] = fitNormalizedContentInside(
      node.size,
      node.paddingInset,
      node.borderInset,
      node.pixelSize,
      properties.svgWidth / properties.svgHeight,
    );
    svgGroup.position.set(
      offsetX - scale * aspectRatio / 2,
      offsetY + scale / 2,
      0,
    );
    svgGroup.scale.setScalar(scale / properties.svgHeight);
    svgGroup.updateMatrix();
  }, [node, svgGroup, properties.svgWidth, properties.svgHeight]);

  useSignalEffect(() => void (svgGroup.visible = !isClipped.value), []);

  return (
    <InteractionGroup matrix={transformMatrix} handlers={properties} hoverHandlers={hoverHandlers}>
      <InteractionPanel rootGroup={rootGroup} psRef={node} size={node.size} />
      <primitive object={svgGroup} />
    </InteractionGroup>
  );
});
