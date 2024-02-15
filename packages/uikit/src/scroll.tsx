import { Signal, computed, signal } from "@preact/signals-core";
import { EventHandlers, ThreeEvent } from "@react-three/fiber/dist/declarations/src/core/events.js";
import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { Group, Matrix4, Vector2, Vector2Tuple, Vector3, Vector4Tuple } from "three";
import { FlexNode, Inset } from "./flex/node.js";
import { Color as ColorRepresentation, useFrame } from "@react-three/fiber";
import { useSignalEffect } from "./utils.js";
import { GetInstancedPanelGroup, MaterialClass, useInstancedPanel } from "./panel/react.js";
import { ClippingRect } from "./clipping.js";
import { clamp } from "three/src/math/MathUtils.js";
import { PanelProperties } from "./panel/instanced-panel.js";
import {
  borderAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from "./properties/alias.js";
import {
  ManagerCollection,
  PropertyTransformation,
  WithReactive,
  useGetBatchedProperties,
} from "./properties/utils.js";

const distanceHelper = new Vector3();
const localPointHelper = new Vector3();

export type ScrollEventHandlers = Pick<
  EventHandlers,
  "onPointerDown" | "onPointerUp" | "onPointerMove" | "onWheel" | "onPointerLeave"
>;

export type ScrollListeners = {
  onScroll?: (
    scrollX: number,
    scrollY: number,
    event?: ThreeEvent<WheelEvent | PointerEvent>,
  ) => void;
};

export function useScrollPosition() {
  return useMemo(() => signal<Vector2Tuple>([0, 0]), []);
}

export function useGlobalScrollMatrix(
  scrollPosition: Signal<Vector2Tuple>,
  node: FlexNode,
  globalMatrix: Signal<Matrix4>,
) {
  return useMemo(
    () =>
      computed(() => {
        const [scrollX, scrollY] = scrollPosition.value;
        const { pixelSize } = node;
        return new Matrix4()
          .makeTranslation(-scrollX * pixelSize, scrollY * pixelSize, 0)
          .premultiply(globalMatrix.value);
      }),
    [node, globalMatrix],
  );
}

export function ScrollGroup({
  node,
  scrollPosition,
  children,
}: {
  node: FlexNode;
  scrollPosition: Signal<Vector2Tuple>;
  children?: ReactNode;
}) {
  const scrollGroup = useMemo(() => {
    const group = new Group();
    group.matrixAutoUpdate = false;
    return group;
  }, []);

  useSignalEffect(() => {
    const [scrollX, scrollY] = scrollPosition.value;
    const { pixelSize } = node;
    scrollGroup.position.set(-scrollX * pixelSize, scrollY * pixelSize, 0);
    scrollGroup.updateMatrix();
  }, [node]);

  return <primitive object={scrollGroup}>{children}</primitive>;
}

export function ScrollHandler(properties: {
  node: FlexNode;
  scrollPosition: Signal<Vector2Tuple>;
  listeners: ScrollListeners;
  children?: ReactNode;
}) {
  const [isScrollable, setIsScrollable] = useState(() =>
    properties.node.scrollable.value.some((scrollable) => scrollable),
  );
  useSignalEffect(
    () => setIsScrollable(properties.node.scrollable.value.some((scrollable) => scrollable)),
    [properties.node],
  );
  if (!isScrollable) {
    return <>{properties.children}</>;
  }
  return <RenderScrollHandler {...properties} />;
}

function RenderScrollHandler({
  node,
  scrollPosition,
  listeners,
  children,
}: {
  node: FlexNode;
  scrollPosition: Signal<Vector2Tuple>;
  listeners: ScrollListeners;
  children?: ReactNode;
}) {
  const onScrollRef = useRef(listeners.onScroll);
  onScrollRef.current = listeners.onScroll;
  const downPointerMap = useMemo(() => new Map(), []);
  const scrollVelocity = useMemo(() => new Vector2(), []);

  const scroll = useCallback(
    (
      event: ThreeEvent<WheelEvent | PointerEvent> | undefined,
      deltaX: number,
      deltaY: number,
      deltaTime: number | undefined,
      enableRubberBand: boolean,
    ) => {
      const [wasScrolledX, wasScrolledY] =
        event == null ? [false, false] : getWasScrolled(event.nativeEvent);
      if (wasScrolledX && wasScrolledY) {
        return;
      }
      const [x, y] = scrollPosition.value;
      const [maxX, maxY] = node.maxScrollPosition.value;
      let [newX, newY] = scrollPosition.value;
      const [ancestorScrollableX, ancestorScrollableY] = node.anyAncestorScrollable?.value ?? [
        false,
        false,
      ];
      if (!wasScrolledX) {
        newX = computeScroll(x, maxX, deltaX, enableRubberBand && !ancestorScrollableX);
      }
      if (!wasScrolledY) {
        newY = computeScroll(y, maxY, deltaY, enableRubberBand && !ancestorScrollableY);
      }
      if (deltaTime != null && deltaTime > 0) {
        scrollVelocity.set(deltaX, deltaY).divideScalar(deltaTime);
      }

      if (event != null) {
        setWasScrolled(
          event.nativeEvent,
          wasScrolledX || Math.min(x, (maxX ?? 0) - x) > 5,
          wasScrolledY || Math.min(y, (maxY ?? 0) - y) > 5,
        );
      }
      if (x != newX || y != newY) {
        scrollPosition.value = [newX, newY];
        onScrollRef.current?.(...scrollPosition.value, event);
      }
    },
    [],
  );

  useFrame((_, deltaTime) => {
    if (downPointerMap.size > 0) {
      return;
    }

    let deltaX = 0;
    let deltaY = 0;
    const [x, y] = scrollPosition.value;
    const [maxX, maxY] = node.maxScrollPosition.value;

    deltaX += outsideDistance(x, 0, maxX ?? 0) * -0.3;
    deltaY += outsideDistance(y, 0, maxY ?? 0) * -0.3;

    deltaX += scrollVelocity.x * deltaTime;
    deltaY += scrollVelocity.y * deltaTime;

    scrollVelocity.multiplyScalar(0.9); //damping scroll factor

    if (Math.abs(scrollVelocity.x) < 0.01) {
      scrollVelocity.x = 0;
    }

    if (Math.abs(scrollVelocity.y) < 0.01) {
      scrollVelocity.y = 0;
    }

    if (deltaX === 0 && deltaY === 0) {
      return;
    }
    scroll(undefined, deltaX, deltaY, undefined, true);
  });

  const ref = useRef<Group>(null);

  return (
    <group
      ref={ref}
      onPointerDown={(event) => {
        let interaction = downPointerMap.get(event.pointerId);
        if (interaction == null) {
          downPointerMap.set(
            event.pointerId,
            (interaction = { timestamp: 0, point: new Vector3() }),
          );
        }
        interaction.timestamp = performance.now() / 1000;
        ref.current!.worldToLocal(interaction.point.copy(event.point));
      }}
      onPointerUp={(event) => {
        downPointerMap.delete(event.pointerId);
      }}
      onPointerLeave={(event) => {
        downPointerMap.delete(event.pointerId);
      }}
      onPointerMove={(event) => {
        const prevInteraction = downPointerMap.get(event.pointerId);

        if (prevInteraction == null) {
          return;
        }
        ref.current!.worldToLocal(localPointHelper.copy(event.point));
        distanceHelper
          .copy(localPointHelper)
          .sub(prevInteraction.point)
          .divideScalar(node.pixelSize);
        const timestamp = performance.now() / 1000;
        const deltaTime = timestamp - prevInteraction.timestamp;

        prevInteraction.point.copy(localPointHelper);
        prevInteraction.timestamp = timestamp;

        if (event.defaultPrevented) {
          return;
        }

        scroll(event, -distanceHelper.x, distanceHelper.y, deltaTime, true);
      }}
      onWheel={(event) => {
        if (event.defaultPrevented) {
          return;
        }
        scroll(event, event.deltaX, event.deltaY, undefined, false);
      }}
    >
      {children}
    </group>
  );
}

const wasScrolledSymbol = Symbol("was-scrolled");

function getWasScrolled(event: any) {
  return (event[wasScrolledSymbol] as [boolean, boolean]) ?? [false, false];
}

function setWasScrolled(event: any, x: boolean, y: boolean): void {
  event[wasScrolledSymbol] = [x, y];
}

function computeScroll(
  position: number,
  maxPosition: number | undefined,
  delta: number,
  enableRubberBand: boolean,
): number {
  if (delta === 0) {
    return position;
  }
  const outside = outsideDistance(position, 0, maxPosition ?? 0);
  if (sign(delta) === sign(outside)) {
    delta *= Math.max(0, 1 - Math.abs(outside) / 100);
  }
  let newPosition = position + delta;
  if (enableRubberBand && maxPosition != null) {
    return newPosition;
  }
  return clamp(newPosition, 0, maxPosition ?? 0);
}

/**
 * true = positivie
 * false = negative
 */
export type Sign = boolean;

function sign(value: number): Sign {
  return value >= 0;
}

function outsideDistance(value: number, min: number, max: number): number {
  if (value < min) {
    return value - min;
  }
  if (value > max) {
    return value - max;
  }
  return 0;
}

export type ScrollbarProperties = {
  scrollbarMaterialClass?: MaterialClass;
} & WithReactive<
  {
    scrollbarWidth?: number;
    scrollbarOpacity?: number;
    scrollbarColor?: ColorRepresentation;
  } & {
    [Key in `scrollbar${Capitalize<
      keyof Omit<PanelProperties, "backgroundColor" | "backgroundOpacity">
    >}`]: PanelProperties;
  }
>;

const scrollbarLength = "scrollbar".length;

function removeScrollbar(key: string) {
  const firstKeyUncapitalized = key[scrollbarLength].toLowerCase();
  return firstKeyUncapitalized + key.slice(scrollbarLength + 1);
}

const scrollbarBorderPropertyTransformation: PropertyTransformation = (
  key,
  value,
  hasProperty,
  setProperty,
) => {
  if (!key.startsWith("scrollbarBorder")) {
    return;
  }
  key = removeScrollbar(key);
  if (hasProperty(key)) {
    setProperty(key, value);
    return;
  }
  borderAliasPropertyTransformation(key, value, hasProperty, setProperty);
};

const scrollbarPanelPropertyTransformation: PropertyTransformation = (
  key,
  value,
  hasProperty,
  setProperty,
) => {
  if (!key.startsWith("scrollbar")) {
    return;
  }
  if (key === "scrollbarOpacity") {
    setProperty("backgroundOpacity", value);
    return;
  }
  if (key === "scrollbarColor") {
    setProperty("backgroundColor", value);
    return;
  }
  key = removeScrollbar(key);
  if (hasProperty(key)) {
    setProperty(key, value);
    return;
  }
  panelAliasPropertyTransformation(key, value, hasProperty, setProperty);
};

export function useScrollbars(
  collection: ManagerCollection,
  scrollPosition: Signal<Vector2Tuple>,
  node: FlexNode,
  globalMatrix: Signal<Matrix4>,
  isClipped: Signal<boolean> | undefined,
  materialClass: MaterialClass | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  providedGetGroup?: GetInstancedPanelGroup,
): void {
  useScrollbar(
    collection,
    0,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    materialClass,
    parentClippingRect,
    providedGetGroup,
  );
  useScrollbar(
    collection,
    1,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    materialClass,
    parentClippingRect,
    providedGetGroup,
  );
}

const propertyKeys = ["scrollbarWidth"] as const;
const borderPropertyKeys = [
  "scrollbarBorderLeft",
  "scrollbarBorderRight",
  "scrollbarBorderTop",
  "scrollbarBorderBottom",
] as const;

function useScrollbar(
  collection: ManagerCollection,
  mainIndex: number,
  scrollPosition: Signal<Vector2Tuple>,
  node: FlexNode,
  globalMatrix: Signal<Matrix4>,
  isClipped: Signal<boolean> | undefined,
  materialClass: MaterialClass | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  providedGetGroup?: GetInstancedPanelGroup,
) {
  const getPropertySignal = useGetBatchedProperties<{ scrollbarWidth?: number }>(
    collection,
    propertyKeys,
  );
  const [scrollbarPosition, scrollbarSize] = useMemo(() => {
    const scrollbarTransformation = computed(() =>
      computeScrollbarTransformation(
        mainIndex,
        getPropertySignal.value("scrollbarWidth") ?? 10,
        node.size.value,
        node.maxScrollPosition.value,
        node.borderInset.value,
        scrollPosition.value,
      ),
    );
    return [
      computed(() => scrollbarTransformation.value.slice(0, 2) as Vector2Tuple),
      computed(() => scrollbarTransformation.value.slice(2, 4) as Vector2Tuple),
    ];
  }, [mainIndex, node]);
  const getBorderPropertySignal = useGetBatchedProperties<{
    scrollbarBorderLeft?: number;
    scrollbarBorderRight?: number;
    scrollbarBorderBottom?: number;
    scrollbarBorderTop?: number;
  }>(collection, borderPropertyKeys, scrollbarBorderPropertyTransformation);
  const borderSize = useMemo(
    () =>
      computed<Inset>(() => {
        const get = getBorderPropertySignal.value;
        return [
          get("scrollbarBorderTop") ?? 0,
          get("scrollbarBorderRight") ?? 0,
          get("scrollbarBorderBottom") ?? 0,
          get("scrollbarBorderLeft") ?? 0,
        ];
      }),
    [],
  );
  const startIndex = collection.length;
  useInstancedPanel(
    collection,
    globalMatrix,
    scrollbarSize,
    scrollbarPosition,
    borderSize,
    isClipped,
    node.depth + 1,
    parentClippingRect,
    materialClass,
    scrollbarPanelPropertyTransformation,
    providedGetGroup,
  );
  //setting the scrollbar color and opacity default for all property managers of the instanced panel 
  const collectionLength = collection.length;
  for (let i = startIndex; i < collectionLength; i++) {
    collection[i].add("scrollbarColor", 0xffffff);
    collection[i].add("scrollbarOpacity", 1);
  }
}

function computeScrollbarTransformation(
  mainIndex: number,
  otherScrollbarSize: number,
  size: Vector2Tuple,
  maxScrollbarPosition: Partial<Vector2Tuple>,
  borderInset: Inset,
  scrollPosition: Vector2Tuple,
) {
  const result: Vector4Tuple = [0, 0, 0, 0];

  const maxMainScrollbarPosition = maxScrollbarPosition[mainIndex];

  if (maxMainScrollbarPosition == null) {
    return result;
  }
  const invertedIndex = 1 - mainIndex;
  const mainSizeWithoutBorder =
    size[mainIndex] - borderInset[invertedIndex] - borderInset[invertedIndex + 2];
  const mainScrollbarSize = Math.max(
    otherScrollbarSize,
    (mainSizeWithoutBorder * mainSizeWithoutBorder) /
      (maxMainScrollbarPosition + mainSizeWithoutBorder),
  );

  const maxScrollbarDistancance = mainSizeWithoutBorder - mainScrollbarSize;
  const mainScrollPosition = scrollPosition[mainIndex];

  //position
  result[mainIndex] =
    size[mainIndex] * 0.5 -
    mainScrollbarSize * 0.5 -
    borderInset[(mainIndex + 3) % 4] -
    maxScrollbarDistancance * clamp(mainScrollPosition / maxMainScrollbarPosition, 0, 1);
  result[invertedIndex] =
    size[invertedIndex] * 0.5 - otherScrollbarSize * 0.5 - borderInset[invertedIndex + 1];

  if (mainIndex === 0) {
    result[0] *= -1;
    result[1] *= -1;
  }

  //size
  result[mainIndex + 2] = mainScrollbarSize;
  result[invertedIndex + 2] = otherScrollbarSize;

  return result;
}
