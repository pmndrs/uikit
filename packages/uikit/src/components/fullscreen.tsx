import { ReactNode, forwardRef, useEffect, useMemo, useRef } from "react";
import { DEFAULT_PIXEL_SIZE, Root, RootProperties } from "./root.js";
import { batch, signal } from "@preact/signals-core";
import { RootState, createPortal, useFrame, useStore, useThree } from "@react-three/fiber";
import { EventHandlers } from "@react-three/fiber/dist/declarations/src/core/events.js";
import { Yoga } from "yoga-wasm-web";
import { ScrollListeners } from "../scroll.js";
import { ComponentInternals, LayoutListeners } from "./utils.js";
import { Group, PerspectiveCamera } from "three";

export const Fullscreen = forwardRef<
  ComponentInternals,
  RootProperties & {
    loadYoga?: () => Promise<Yoga>;
    children?: ReactNode;
    precision?: number;
    pixelSize?: number;
    attachCamera?: boolean;
  } & EventHandlers &
    LayoutListeners &
    ScrollListeners
>((properties, ref) => {
  const pixelSize = properties.pixelSize ?? DEFAULT_PIXEL_SIZE;
  const [sizeX, sizeY] = useMemo(() => [signal(0), signal(0)] as const, []);
  const store = useStore();
  useEffect(() => {
    const fn = (state: RootState) => {
      batch(() => {
        sizeX.value = state.size.width * pixelSize;
        sizeY.value = state.size.height * pixelSize;
      });
    };
    fn(store.getState());
    return store.subscribe(fn);
  }, [store, pixelSize]);
  const camera = useThree((s) => s.camera);
  const groupRef = useRef<Group>(null);
  useFrame(() => {
    if (groupRef.current == null) {
      return;
    }
    let distance = 1;
    if (camera instanceof PerspectiveCamera) {
      distance = sizeY.peek() / (2 * Math.tan((camera.fov / 360) * Math.PI));
    }
    groupRef.current.position.z = -distance;
    groupRef.current.updateMatrix();
  });
  const attachCamera = properties.attachCamera ?? true;
  if (attachCamera) {
    return (
      <primitive object={camera}>
        <group ref={groupRef} matrixAutoUpdate={false}>
          <Root ref={ref} {...properties} sizeX={sizeX} sizeY={sizeY}>
            {properties.children}
          </Root>
        </group>
      </primitive>
    );
  }
  //assume the camera is already attached => use a portal
  return createPortal(
    <group ref={groupRef} matrixAutoUpdate={false}>
      <Root ref={ref} {...properties} sizeX={sizeX} sizeY={sizeY}>
        {properties.children}
      </Root>
    </group>,
    camera,
  );
});
