import { Signal, computed, effect } from "@preact/signals-core";
import { useMemo, useEffect, createContext, useContext } from "react";
import { Matrix4, Vector2Tuple } from "three";

export const rootIdentiferKey = Symbol("root-identifier-key");
export const orderKey = Symbol("order-key");

const ElementRenderPriority = {
  Object: 0, //render last
  Text: 1,
  Svg: 2,
  Image: 3,
  Custom: 4,
  Panel: 5,
};

export function setRootIdentifier<T>(
  result: T,
  rootIdentifier: unknown,
  type: keyof typeof ElementRenderPriority,
): T {
  (result as any)[rootIdentiferKey] = rootIdentifier;
  (result as any)[orderKey] = ElementRenderPriority[type];
  return result;
}

export type LayoutListeners = {
  onSizeChange?: (width: number, height: number) => void;
};

export function useLayoutListeners(
  { onSizeChange }: LayoutListeners,
  size: Signal<Vector2Tuple>,
): void {
  const unsubscribe = useMemo(() => {
    if (onSizeChange == null) {
      return undefined;
    }
    let first = true;
    return effect(() => {
      const s = size.value;
      if (first) {
        first = false;
        return;
      }
      onSizeChange(...s);
    });
  }, [onSizeChange, size]);
  useEffect(() => unsubscribe, [unsubscribe]);
}

export type ViewportListeners = {
  onIsInViewportChange?: (isInViewport: boolean) => void;
};

export function useViewportListeners(
  { onIsInViewportChange }: ViewportListeners,
  isClipped: Signal<boolean>,
) {
  const unsubscribe = useMemo(() => {
    if (onIsInViewportChange == null) {
      return undefined;
    }
    let first = true;
    return effect(() => {
      const isInViewport = !isClipped.value;
      if (first) {
        first = false;
        return;
      }
      onIsInViewportChange(isInViewport);
    });
  }, [onIsInViewportChange]);
  useEffect(() => unsubscribe, [unsubscribe]);
}

export function useGlobalMatrix(localMatrix: Signal<Matrix4>): Signal<Matrix4> {
  const parentMatrix = useContext(MatrixContext);
  return useMemo(
    () => computed(() => parentMatrix.value.clone().multiply(localMatrix.value)),
    [localMatrix, parentMatrix],
  );
}

const MatrixContext = createContext<Signal<Matrix4>>(null as any);

export const MatrixProvider = MatrixContext.Provider;
