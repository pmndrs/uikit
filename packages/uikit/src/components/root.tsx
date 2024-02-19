import { Yoga } from "yoga-wasm-web";
import { ReactNode, forwardRef, useEffect, useMemo } from "react";
import { FlexNode, YogaProperties, createDeferredRequestLayoutCalculation } from "../flex/node.js";
import { RootGroupProvider, alignmentXMap, alignmentYMap, useResource } from "../utils.js";
import { loadYogaBase64 } from "../flex/load-base64.js";
import {
  InstancedPanelProvider,
  InteractionGroup,
  MaterialClass,
  useGetInstancedPanelGroup,
  useInstancedPanel,
  useInteractionPanel,
} from "../panel/react.js";
import {
  WithReactive,
  createCollection,
  finalizeCollection,
  writeCollection,
} from "../properties/utils.js";
import { FlexProvider } from "../flex/react.js";
import { EventHandlers } from "@react-three/fiber/dist/declarations/src/core/events.js";
import { ReadonlySignal, Signal, computed } from "@preact/signals-core";
import { Group, Matrix4, Plane, RenderItem, Vector2Tuple, Vector3, WebGLRenderer } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useApplyHoverProperties } from "../hover.js";
import {
  rootIdentiferKey,
  orderKey,
  LayoutListeners,
  useLayoutListeners,
  MatrixProvider,
  ComponentInternals,
  useComponentInternals,
  WithConditionals,
} from "./utils.js";
import { ClippingRectProvider, useClippingRect, useParentClippingRect } from "../clipping.js";
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
import { TransformProperties, useTransformMatrix } from "../transform.js";
import { useImmediateProperties } from "../properties/immediate.js";
import { WithClasses, useApplyProperties } from "../properties/default.js";
import { InstancedGlyphProvider, useGetInstancedGlyphGroup } from "../text/react.js";
import { PanelProperties } from "../panel/instanced-panel.js";
import { RootSizeProvider, useApplyResponsiveProperties } from "../responsive.js";

export const DEFAULT_PRECISION = 0.1;
export const DEFAULT_PIXEL_SIZE = 0.002;

export function useRootLayout() {}

export type RootProperties = WithConditionals<
  WithClasses<
    WithAllAliases<
      WithReactive<
        Omit<YogaProperties, "width" | "height"> & TransformProperties & PanelProperties
      > &
        ScrollbarProperties
    >
  >
>;

const planeHelper = new Plane();
const vectorHelper = new Vector3();

export const Root = forwardRef<
  ComponentInternals,
  RootProperties & {
    loadYoga?: () => Promise<Yoga>;
    children?: ReactNode;
    precision?: number;
    anchorX?: keyof typeof alignmentXMap;
    anchorY?: keyof typeof alignmentYMap;
    pixelSize?: number;
    backgroundMaterialClass?: MaterialClass;
  } & WithReactive<{
      sizeX?: number;
      sizeY?: number;
    }> &
    EventHandlers &
    LayoutListeners &
    ScrollListeners
>((properties, ref) => {
  const collection = createCollection();
  const renderer = useThree(({ gl }) => gl);
  useEffect(() => patchRenderOrder(renderer), [renderer]);
  const { sizeX, sizeY } = properties;
  const [precision, pixelSize] = useMemo(
    () => [properties.precision ?? DEFAULT_PRECISION, properties.pixelSize ?? DEFAULT_PIXEL_SIZE],
    [],
  );
  const yoga = useResource(properties.loadYoga ?? loadYogaBase64, [properties.loadYoga]);
  const distanceToCameraRef = useMemo(() => ({ distance: 0 }), []);
  const node = useMemo(
    () =>
      new FlexNode(
        //root identifier = unique empty object = {}
        distanceToCameraRef,
        yoga,
        precision,
        pixelSize,
        createDeferredRequestLayoutCalculation(),
        0,
        undefined,
      ),
    [yoga],
  );
  useImmediateProperties(collection, node, flexAliasPropertyTransformation);
  useEffect(() => () => node.destroy(), [node]);

  const transformMatrix = useTransformMatrix(collection, node);

  const rootGroup = useMemo(() => {
    const group = new Group();
    group.matrixAutoUpdate = false;
    return group;
  }, []);
  const getPanelGroup = useGetInstancedPanelGroup(pixelSize, node.rootIdentifier, rootGroup);
  const getGylphGroup = useGetInstancedGlyphGroup(pixelSize, node.rootIdentifier, rootGroup);

  const rootMatrix = useRootMatrix(transformMatrix, node.size, pixelSize, properties);
  const scrollPosition = useScrollPosition();
  const globalScrollMatrix = useGlobalScrollMatrix(scrollPosition, node, rootMatrix);
  useScrollbars(
    collection,
    scrollPosition,
    node,
    rootMatrix,
    undefined,
    properties.scrollbarMaterialClass,
    undefined,
    getPanelGroup,
  );

  useInstancedPanel(
    collection,
    rootMatrix,
    node.size,
    undefined,
    node.borderInset,
    undefined,
    node.depth,
    undefined,
    properties.backgroundMaterialClass,
    panelAliasPropertyTransformation,
    getPanelGroup,
  );

  //apply all properties
  useApplyProperties(collection, properties);
  useApplyResponsiveProperties(collection, properties, node.size);
  const hoverHandlers = useApplyHoverProperties(collection, properties);
  writeCollection(collection, "width", useDivide(sizeX, pixelSize));
  writeCollection(collection, "height", useDivide(sizeY, pixelSize));
  finalizeCollection(collection);

  const clippingRect = useClippingRect(
    rootMatrix,
    node.size,
    node.borderInset,
    node.overflow,
    node,
    undefined,
  );
  useLayoutListeners(properties, node.size);

  const internactionPanel = useInteractionPanel(node.size, node, rootGroup);

  useComponentInternals(ref, node, internactionPanel, scrollPosition);

  useFrame(({ camera }) => {
    planeHelper.normal.set(0, 0, 1);
    planeHelper.constant = 0;
    planeHelper.applyMatrix4(internactionPanel.matrixWorld);
    vectorHelper.setFromMatrixPosition(camera.matrixWorld);
    distanceToCameraRef.distance = planeHelper.distanceToPoint(vectorHelper);
  });

  return (
    <primitive object={rootGroup}>
      <RootGroupProvider value={rootGroup}>
        <InstancedGlyphProvider value={getGylphGroup}>
          <InstancedPanelProvider value={getPanelGroup}>
            <InteractionGroup
              matrix={rootMatrix}
              handlers={properties}
              hoverHandlers={hoverHandlers}
            >
              <ScrollHandler node={node} scrollPosition={scrollPosition} listeners={properties}>
                <primitive object={internactionPanel} />
              </ScrollHandler>
              <ScrollGroup node={node} scrollPosition={scrollPosition}>
                <MatrixProvider value={globalScrollMatrix}>
                  <FlexProvider value={node}>
                    <ClippingRectProvider value={clippingRect}>
                      <RootSizeProvider value={node.size}>{properties.children}</RootSizeProvider>
                    </ClippingRectProvider>
                  </FlexProvider>
                </MatrixProvider>
              </ScrollGroup>
            </InteractionGroup>
          </InstancedPanelProvider>
        </InstancedGlyphProvider>
      </RootGroupProvider>
    </primitive>
  );
});

function useDivide(
  size: number | Signal<number | undefined | null> | undefined,
  pixelSize: number,
): ReadonlySignal<number | undefined> | number | undefined {
  return useMemo(
    () =>
      size === undefined
        ? undefined
        : size instanceof Signal
        ? computed(() => {
            const s = size.value;
            if (s == null) {
              return undefined;
            }
            return s / pixelSize;
          })
        : size / pixelSize,
    [size, pixelSize],
  );
}

const matrixHelper = new Matrix4();

function useRootMatrix(
  matrix: Signal<Matrix4>,
  size: Signal<Vector2Tuple>,
  pixelSize: number,
  {
    anchorX = "center",
    anchorY = "center",
  }: {
    anchorX?: keyof typeof alignmentXMap;
    anchorY?: keyof typeof alignmentYMap;
  },
) {
  return useMemo(
    () =>
      computed(() => {
        const [width, height] = size.value;
        return matrix.value
          .clone()
          .premultiply(
            matrixHelper.makeTranslation(
              alignmentXMap[anchorX] * width * pixelSize,
              alignmentYMap[anchorY] * height * pixelSize,
              0,
            ),
          );
      }),
    [matrix, size, anchorX, anchorY, pixelSize],
  );
}

function reversePainterSortStable(a: RenderItem, b: RenderItem) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  }
  if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  }
  const aDistanceRef = (a.object as any)[rootIdentiferKey];
  const bDistanceRef = (b.object as any)[rootIdentiferKey];
  if (aDistanceRef == null || bDistanceRef == null) {
    return a.z !== b.z ? b.z - a.z : a.id - b.id;
  }
  if (aDistanceRef === bDistanceRef) {
    return (a.object as any)[orderKey] - (a.object as any)[orderKey];
  }
  return bDistanceRef.distance - aDistanceRef.distance;
}

export function patchRenderOrder(renderer: WebGLRenderer): void {
  renderer.setTransparentSort(reversePainterSortStable);
}
