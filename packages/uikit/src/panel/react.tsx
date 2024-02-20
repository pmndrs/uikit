import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { Group, Material, Matrix4, Mesh, MeshBasicMaterial, Plane, Vector2Tuple } from 'three'
import type { EventHandlers, ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { Signal, effect } from '@preact/signals-core'
import { Inset } from '../flex/node.js'
import { useSignalEffect } from '../utils.js'
import { useFrame } from '@react-three/fiber'
import { ClippingRect, useParentClippingRect } from '../clipping.js'
import { makeClippedRaycast, makePanelRaycast } from './interaction-panel-mesh.js'
import { HoverEventHandlers } from '../hover.js'
import { InstancedPanelGroup } from './instanced-panel-group.js'
import { InstancedPanel } from './instanced-panel.js'
import { createInstancedPanelMaterial, createPanelMaterial } from './panel-material.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { ManagerCollection, PropertyTransformation } from '../properties/utils.js'
import { useBatchedProperties } from '../properties/batched.js'

export function InteractionGroup({
  handlers,
  hoverHandlers,
  matrix,
  children,
}: {
  handlers: EventHandlers
  hoverHandlers: HoverEventHandlers | undefined
  matrix: Signal<Matrix4>
  children?: ReactNode
}) {
  const groupRef = useRef<Group>(null)
  useEffect(() => {
    const group = groupRef.current
    if (group == null) {
      return
    }
    return effect(() => group.matrix.copy(matrix.value))
  }, [matrix])
  return (
    <group
      ref={groupRef}
      /** handlers + hover handlers */
      onPointerOut={mergeHandlers(handlers.onPointerOut, hoverHandlers?.onPointerOut)}
      onPointerOver={mergeHandlers(handlers.onPointerOver, hoverHandlers?.onPointerOver)}
      /** only handlers */
      onPointerUp={handlers.onPointerUp}
      onPointerDown={handlers.onPointerDown}
      onPointerMove={handlers.onPointerMove}
      onWheel={handlers.onWheel}
      onPointerLeave={handlers.onPointerLeave}
      onClick={handlers.onClick}
      onContextMenu={handlers.onContextMenu}
      onDoubleClick={handlers.onDoubleClick}
      onPointerCancel={handlers.onPointerCancel}
      onPointerEnter={handlers.onPointerEnter}
      onPointerMissed={handlers.onPointerMissed}
      matrixAutoUpdate={false}
    >
      {children}
    </group>
  )
}

function mergeHandlers<T extends (event: ThreeEvent<PointerEvent>) => void>(
  userHandler: T | undefined,
  systemHandler: T | undefined,
): T | undefined {
  if (userHandler == null) {
    return systemHandler
  }
  if (systemHandler == null) {
    return userHandler
  }
  return ((e: ThreeEvent<PointerEvent>) => {
    systemHandler(e)
    if (e.stopped) {
      return
    }
    userHandler(e)
  }) as T
}

export function useInteractionPanel(
  size: Signal<Vector2Tuple>,
  psRef: { pixelSize: number; depth: number },
  rootGroup: Group,
): Mesh {
  const parentClippingRect = useParentClippingRect()
  const panel = useMemo(() => {
    const result = new Mesh()
    result.matrixAutoUpdate = false
    result.raycast = makeClippedRaycast(result, makePanelRaycast(result, psRef.depth), rootGroup, parentClippingRect)
    result.visible = false
    return result
  }, [parentClippingRect, psRef.depth, rootGroup])
  useSignalEffect(() => {
    const [width, height] = size.value
    panel.scale.set(width * psRef.pixelSize, height * psRef.pixelSize, 1)
    panel.updateMatrix()
  }, [size, psRef])
  return panel
}

export type MaterialClass = { new (): Material }

export type GetInstancedPanelGroup = (materialClass: MaterialClass) => InstancedPanelGroup

const InstancedPanelContext = createContext<GetInstancedPanelGroup>(null as any)

export function usePanelMaterial(
  collection: ManagerCollection,
  size: Signal<Vector2Tuple>,
  borderInset: Signal<Inset>,
  isClipped: Signal<boolean>,
  materialClass: MaterialClass | undefined,
  clippingPlanes: Array<Plane>,
  propertyTransformation: PropertyTransformation,
) {
  const material = useMemo(() => {
    const MaterialClass = createPanelMaterial(materialClass ?? MeshBasicMaterial)
    const result = new MaterialClass()
    result.clippingPlanes = clippingPlanes
    result.setup(size, borderInset, isClipped)
    return result
  }, [size, borderInset, isClipped, materialClass, clippingPlanes])
  const immediate = useImmediateProperties(collection, material, propertyTransformation)
  const batched = useBatchedProperties(collection, material, propertyTransformation)
  useEffect(() => () => material.destroy(), [material])
  return material
}

/**
 * @param providedGetGroup provdedGetGroup should onlyever be used for inside the root component (don't provide it otherwise)
 */
export function useInstancedPanel(
  collection: ManagerCollection,
  matrix: Signal<Matrix4>,
  size: Signal<Vector2Tuple>,
  offset: Signal<Vector2Tuple> | undefined,
  borderInset: Signal<Inset>,
  isHidden: Signal<boolean> | undefined,
  depth: number,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  materialClass: MaterialClass = MeshBasicMaterial,
  propertyTransformation: PropertyTransformation,
  providedGetGroup?: GetInstancedPanelGroup,
): void {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getGroup = providedGetGroup ?? useContext(InstancedPanelContext)
  const panel = useMemo(
    () =>
      new InstancedPanel(
        getGroup(materialClass),
        matrix,
        size,
        offset,
        borderInset,
        parentClippingRect,
        isHidden,
        depth,
      ),
    [getGroup, materialClass, matrix, size, borderInset, parentClippingRect, isHidden, depth, offset],
  )
  useEffect(() => () => panel.destroy(), [panel])
  useImmediateProperties(collection, panel, propertyTransformation)
  useBatchedProperties(collection, panel, propertyTransformation)
}

export function useGetInstancedPanelGroup(pixelSize: number, rootIdentifier: unknown, rootGroup: Group) {
  const map = useMemo(() => new Map<MaterialClass, InstancedPanelGroup>(), [])
  const getGroup = useCallback<GetInstancedPanelGroup>(
    (materialClass) => {
      let result = map.get(materialClass)
      if (result == null) {
        const InstancedMaterialClass = createInstancedPanelMaterial(materialClass)
        map.set(
          materialClass,
          (result = new InstancedPanelGroup(new InstancedMaterialClass(), pixelSize, rootIdentifier)),
        )
        rootGroup.add(result)
      }
      return result
    },
    [pixelSize, map, rootIdentifier, rootGroup],
  )

  useFrame((_, delta) => {
    for (const group of map.values()) {
      group.onFrame(delta)
    }
  })
  return getGroup
}

export const InstancedPanelProvider = InstancedPanelContext.Provider
