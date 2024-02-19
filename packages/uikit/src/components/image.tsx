import { Mesh, SRGBColorSpace, Texture, TextureLoader, Vector2Tuple } from "three";
import { forwardRef, useMemo } from "react";
import { useResourceWithParams, useRootGroup, useSignalEffect } from "../utils.js";
import { Signal, computed } from "@preact/signals-core";
import { Inset, YogaProperties } from "../flex/node.js";
import { panelGeometry } from "../panel/utils.js";
import { InteractionGroup, MaterialClass, usePanelMaterial } from "../panel/react.js";
import { useFlexNode } from "../flex/react.js";
import { EventHandlers } from "@react-three/fiber/dist/declarations/src/core/events.js";
import { useApplyHoverProperties } from "../hover.js";
import {
  ComponentInternals,
  LayoutListeners,
  ViewportListeners,
  WithConditionals,
  setRootIdentifier,
  useComponentInternals,
  useGlobalMatrix,
  useLayoutListeners,
  useViewportListeners,
} from "./utils.js";
import { useGlobalClippingPlanes, useIsClipped, useParentClippingRect } from "../clipping.js";
import { makeClippedRaycast, makePanelRaycast } from "../panel/interaction-panel-mesh.js";
import { PanelProperties } from "../panel/instanced-panel.js";
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from "../properties/alias.js";
import { TransformProperties, useTransformMatrix } from "../transform.js";
import {
  ManagerCollection,
  PropertyTransformation,
  WithReactive,
  createCollection,
  finalizeCollection,
  useGetBatchedProperties,
  writeCollection,
} from "../properties/utils.js";
import { useImmediateProperties } from "../properties/immediate.js";
import { WithClasses, useApplyProperties } from "../properties/default.js";
import { useApplyResponsiveProperties } from "../responsive.js";

export type ImageFit = "cover" | "fill";
const FIT_DEFAULT: ImageFit = "fill";

export type ImageProperties = WithConditionals<
  WithClasses<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          Omit<PanelProperties, "backgroundColor" | "backgroundOpacity"> & {
            opacity?: number;
          } & TransformProperties &
          ImageFitProperties
      >
    >
  >
>;

export type ImageFitProperties = {
  fit?: ImageFit;
};

const materialPropertyTransformation: PropertyTransformation = (
  key,
  value,
  hasProperty,
  setProperty,
) => {
  if (key === "opacity") {
    setProperty("backgroundOpacity", value);
    return;
  }
  panelAliasPropertyTransformation(key, value, hasProperty, setProperty);
};

export const Image = forwardRef<
  ComponentInternals,
  ImageProperties & {
    index?: number;
    src: string | Signal<string>;
    materialClass?: MaterialClass;
  } & EventHandlers &
    LayoutListeners &
    ViewportListeners
>((properties, ref) => {
  const collection = createCollection();
  const texture = useResourceWithParams(loadTexture, properties.src);
  const aspectRatio = useMemo(
    () =>
      computed(() => {
        const tex = texture.value;
        if (tex == null) {
          return undefined;
        }
        return tex.image.width / tex.image.height;
      }),
    [texture],
  );
  const node = useFlexNode(properties.index);
  useImmediateProperties(collection, node, flexAliasPropertyTransformation);
  useTextureFit(collection, texture, node.borderInset, node.size);
  const transformMatrix = useTransformMatrix(collection, node);
  const parentClippingRect = useParentClippingRect();
  const rootGroup = useRootGroup();
  const clippingPlanes = useGlobalClippingPlanes(parentClippingRect, rootGroup);
  const globalMatrix = useGlobalMatrix(transformMatrix);
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node);
  const material = usePanelMaterial(
    collection,
    node.size,
    node.borderInset,
    isClipped,
    properties.materialClass,
    clippingPlanes,
    materialPropertyTransformation,
  );
  const mesh = useMemo(() => {
    const result = new Mesh(panelGeometry, material);
    result.matrixAutoUpdate = false;
    result.raycast = makeClippedRaycast(
      result,
      makePanelRaycast(result, node.depth),
      rootGroup,
      parentClippingRect,
    );
    setRootIdentifier(result, node.rootIdentifier, "Image");
    return result;
  }, [node, material, rootGroup, parentClippingRect]);

  //apply all properties
  useApplyProperties(collection, properties);
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties);
  writeCollection(collection, "backgroundColor", 0xffffff);
  writeCollection(collection, "aspectRatio", aspectRatio);
  finalizeCollection(collection);

  useLayoutListeners(properties, node.size);
  useViewportListeners(properties, isClipped);

  useSignalEffect(() => {
    const map = texture.value ?? null;
    if ((mesh.material as any).map === map) {
      return;
    }
    (mesh.material as any).map = map;
    mesh.material.needsUpdate = true;
  }, [mesh, texture]);

  useSignalEffect(() => {
    const [width, height] = node.size.value;
    mesh.scale.set(width * node.pixelSize, height * node.pixelSize, 1);
    mesh.updateMatrix();
  }, [mesh]);

  useSignalEffect(() => void (mesh.visible = !isClipped.value), [mesh, isClipped]);

  useComponentInternals(ref, node, mesh);

  return (
    <InteractionGroup hoverHandlers={hoverHandlers} handlers={properties} matrix={transformMatrix}>
      <primitive object={mesh} />
    </InteractionGroup>
  );
});

const propertyKeys = ["fit"] as const;

function useTextureFit(
  collection: ManagerCollection,
  textureSignal: Signal<Texture | undefined>,
  borderInset: Signal<Inset>,
  size: Signal<Vector2Tuple>,
): void {
  const getPropertySignal = useGetBatchedProperties<ImageFitProperties>(collection, propertyKeys);
  useSignalEffect(() => {
    const texture = textureSignal.value;
    if (texture == null) {
      return;
    }
    const fitValue = getPropertySignal.value("fit") ?? FIT_DEFAULT;
    texture.matrix.identity();

    if (fitValue === "fill" || texture == null) {
      transformInsideBorder(borderInset, size, texture);
      return;
    }

    const textureRatio = texture.image.width / texture.image.height;

    const [width, height] = size.value;
    const [top, right, bottom, left] = borderInset.value;
    const boundsRatioValue = (width - left - right) / (height - top - bottom);

    if (fitValue === "cover") {
      if (textureRatio > boundsRatioValue) {
        texture.matrix
          .translate(-(0.5 * (boundsRatioValue - textureRatio)) / boundsRatioValue, 0)
          .scale(boundsRatioValue / textureRatio, 1);
      } else {
        texture.matrix
          .translate(0, -(0.5 * (textureRatio - boundsRatioValue)) / textureRatio)
          .scale(1, textureRatio / boundsRatioValue);
      }
      transformInsideBorder(borderInset, size, texture);
      return;
    }

    if (textureRatio > boundsRatioValue) {
      texture.matrix
        .translate(0, (-0.5 * (textureRatio - boundsRatioValue)) / textureRatio)
        .scale(1, boundsRatioValue / textureRatio);
    } else {
      texture.matrix
        .translate((0.5 * (boundsRatioValue - textureRatio)) / boundsRatioValue, 0)
        .scale(textureRatio / boundsRatioValue, 1);
    }
    transformInsideBorder(borderInset, size, texture);
  }, [textureSignal, borderInset, size]);
}

function transformInsideBorder(
  borderInset: Signal<Inset>,
  size: Signal<Vector2Tuple>,
  texture: Texture,
): void {
  const [outerWidth, outerHeight] = size.value;
  const [top, right, bottom, left] = borderInset.value;

  const width = outerWidth - left - right;
  const height = outerHeight - top - bottom;

  texture.matrix
    .translate(-1 + (left + width) / outerWidth, -1 + (top + height) / outerHeight)
    .scale(outerWidth / width, outerHeight / height);
}

const textureLoader = new TextureLoader();

function loadTexture(url: string) {
  return textureLoader
    .loadAsync(url)
    .then((texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.matrixAutoUpdate = false;
      return texture;
    })
    .catch((error) => {
      console.error(error);
      return undefined;
    });
}
