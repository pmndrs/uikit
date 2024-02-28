import { ReactNode, RefObject, createContext, useCallback, useContext, useEffect, useMemo } from 'react'
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
import { MaterialSetter, PanelDepthMaterial, PanelDistanceMaterial, createPanelMaterial } from './panel-material.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { ManagerCollection, PropertyTransformation } from '../properties/utils.js'
import { useBatchedProperties } from '../properties/batched.js'
import { CameraDistanceRef, ElementType, OrderInfo } from '../order.js'
import { panelGeometry } from './utils.js'

export function InteractionGroup({
  handlers,
  hoverHandlers,
  matrix,
  children,
  groupRef,
}: {
  handlers: EventHandlers
  hoverHandlers: HoverEventHandlers | undefined
  matrix: Signal<Matrix4>
  children?: ReactNode
  groupRef: RefObject<Group>
}) {
  useEffect(() => {
    const group = groupRef.current
    if (group == null) {
      return
    }
    return effect(() => group.matrix.copy(matrix.value))
  }, [groupRef, matrix])
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

function mergeHandlers(
  userHandler: ((event: ThreeEvent<PointerEvent>) => void) | undefined,
  systemHandler: ((event: ThreeEvent<PointerEvent>) => void) | undefined,
): ((event: ThreeEvent<PointerEvent>) => void) | undefined {
  if (userHandler == null) {
    return systemHandler
  }
  if (systemHandler == null) {
    return userHandler
  }
  return (e: ThreeEvent<PointerEvent>) => {
    systemHandler(e)
    if (e.stopped) {
      return
    }
    userHandler(e)
  }
}

export function useInteractionPanel(
  size: Signal<Vector2Tuple>,
  psRef: { pixelSize: number },
  orderInfo: OrderInfo,
  rootGroupRef: RefObject<Group>,
): Mesh {
  const parentClippingRect = useParentClippingRect()
  const panel = useMemo(() => {
    const result = new Mesh(panelGeometry)
    result.matrixAutoUpdate = false
    result.raycast = makeClippedRaycast(result, makePanelRaycast(result), rootGroupRef, parentClippingRect, orderInfo)
    result.visible = false
    return result
  }, [parentClippingRect, orderInfo, rootGroupRef])
  useSignalEffect(() => {
    const [width, height] = size.value
    panel.scale.set(width * psRef.pixelSize, height * psRef.pixelSize, 1)
    panel.updateMatrix()
  }, [size, psRef])
  return panel
}

export type MaterialClass = { new (...args: Array<any>): Material }

export type GetInstancedPanelGroup = (
  majorIndex: number,
  panelGroupDependencies: PanelGroupDependencies,
) => InstancedPanelGroup

const InstancedPanelContext = createContext<GetInstancedPanelGroup>(null as any)

export function usePanelMaterials(
  collection: ManagerCollection,
  size: Signal<Vector2Tuple>,
  borderInset: Signal<Inset>,
  isClipped: Signal<boolean>,
  materialClass: MaterialClass | undefined,
  clippingPlanes: Array<Plane>,
  propertyTransformation: PropertyTransformation,
): readonly [Material, Material, Material] {
  const { materials, setter } = useMemo(() => {
    const setter = new MaterialSetter(size, borderInset, isClipped)
    const info = { data: setter.data, type: 'normal' } as const
    const material = createPanelMaterial(materialClass ?? MeshBasicMaterial, info)
    const depthMaterial = new PanelDepthMaterial(info)
    const distanceMaterial = new PanelDistanceMaterial(info)
    material.clippingPlanes = clippingPlanes
    depthMaterial.clippingPlanes = clippingPlanes
    distanceMaterial.clippingPlanes = clippingPlanes
    return { materials: [material, depthMaterial, distanceMaterial], setter } as const
  }, [size, borderInset, isClipped, materialClass, clippingPlanes])
  useImmediateProperties(collection, setter, propertyTransformation)
  useBatchedProperties(collection, setter, propertyTransformation)
  useEffect(() => () => setter.destroy(), [setter])
  return materials
}

export type PanelGroupDependencies = {
  materialClass: MaterialClass
  receiveShadow: boolean
  castShadow: boolean
} & ShadowProperties

export type ShadowProperties = { receiveShadow?: boolean; castShadow?: boolean }

export function usePanelGroupDependencies(
  materialClass: MaterialClass = MeshBasicMaterial,
  { castShadow = false, receiveShadow = false }: ShadowProperties,
): PanelGroupDependencies {
  return useMemo(
    () => ({
      materialClass,
      castShadow,
      receiveShadow,
    }),
    [materialClass, castShadow, receiveShadow],
  )
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
  orderInfo: OrderInfo,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  panelGroupDependencies: PanelGroupDependencies,
  propertyTransformation: PropertyTransformation,
  providedGetGroup?: GetInstancedPanelGroup,
): void {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getGroup = providedGetGroup ?? useContext(InstancedPanelContext)
  const panel = useMemo(
    () =>
      new InstancedPanel(
        getGroup(orderInfo.majorIndex, panelGroupDependencies),
        matrix,
        size,
        offset,
        borderInset,
        parentClippingRect,
        isHidden,
        orderInfo.minorIndex,
      ),
    [getGroup, matrix, size, borderInset, parentClippingRect, isHidden, orderInfo, offset, panelGroupDependencies],
  )
  useEffect(() => () => panel.destroy(), [panel])
  useImmediateProperties(collection, panel, propertyTransformation)
  useBatchedProperties(collection, panel, propertyTransformation)
}

export function useGetInstancedPanelGroup(
  pixelSize: number,
  cameraDistance: CameraDistanceRef,
  groupsContainer: Group,
) {
  const map = useMemo(() => new Map<MaterialClass, Map<number, InstancedPanelGroup>>(), [])
  const getGroup = useCallback<GetInstancedPanelGroup>(
    (majorIndex, { materialClass, receiveShadow, castShadow }) => {
      let groups = map.get(materialClass)
      if (groups == null) {
        map.set(materialClass, (groups = new Map()))
      }
      const key = (majorIndex << 2) + ((receiveShadow ? 1 : 0) << 1) + (castShadow ? 1 : 0)
      let group = groups.get(key)
      if (group == null) {
        const material = createPanelMaterial(materialClass, { type: 'instanced' })
        groups.set(
          key,
          (group = new InstancedPanelGroup(
            material,
            pixelSize,
            cameraDistance,
            {
              elementType: ElementType.Panel,
              majorIndex,
              minorIndex: 0,
            },
            receiveShadow,
            castShadow,
          )),
        )
        groupsContainer.add(group)
      }
      return group
    },
    [pixelSize, map, cameraDistance, groupsContainer],
  )

  useFrame((_, delta) => {
    for (const groups of map.values()) {
      for (const group of groups.values()) {
        group.onFrame(delta)
      }
    }
  })
  return getGroup
}

export const InstancedPanelProvider = InstancedPanelContext.Provider
