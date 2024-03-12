import { Group, Matrix4, Mesh, MeshBasicMaterial, Vector2Tuple } from 'three'
import type { EventHandlers, ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { Signal, computed, effect } from '@preact/signals-core'
import { Subscriptions } from '../utils.js'
import { useFrame } from '@react-three/fiber'
import { ClippingRect } from '../clipping.js'
import { makeClippedRaycast, makePanelRaycast } from './interaction-panel-mesh.js'
import { HoverEventHandlers } from '../hover.js'
import { InstancedPanelGroup } from './instanced-panel-group.js'
import { MaterialClass, createPanelMaterial } from './panel-material.js'
import { CameraDistanceRef, ElementType, OrderInfo } from '../order.js'
import { panelGeometry } from './utils.js'
import { ActiveEventHandlers } from '../active.js'
import { MergedProperties } from '../properties/merged.js'
import { createGetBatchedProperties } from '../properties/batched.js'
import { Inset } from '../flex/node.js'
import { InstancedPanel } from './instanced-panel.js'

export function InteractionGroup({
  handlers,
  hoverHandlers,
  activeHandlers,
  matrix,
  children,
  groupRef,
}: {
  handlers: EventHandlers
  hoverHandlers: HoverEventHandlers | undefined
  activeHandlers: ActiveEventHandlers | undefined
  matrix: Signal<Matrix4 | undefined>
  children?: ReactNode
  groupRef: RefObject<Group>
}) {
  useEffect(() => {
    const group = groupRef.current
    if (group == null) {
      return
    }
    return effect(() => matrix.value != null && group.matrix.copy(matrix.value))
  }, [groupRef, matrix])
  return (
    <group
      ref={groupRef}
      /** handlers + hover handlers */
      onPointerOut={mergeHandlers(handlers.onPointerOut, hoverHandlers?.onPointerOut)}
      onPointerOver={mergeHandlers(handlers.onPointerOver, hoverHandlers?.onPointerOver)}
      /** handlers + active handlers */
      onPointerUp={mergeHandlers(handlers.onPointerUp, activeHandlers?.onPointerUp)}
      onPointerDown={mergeHandlers(handlers.onPointerDown, activeHandlers?.onPointerDown)}
      onPointerLeave={mergeHandlers(handlers.onPointerLeave, activeHandlers?.onPointerLeave)}
      /** only handlers */
      onPointerMove={handlers.onPointerMove}
      onWheel={handlers.onWheel}
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

export function createInteractionPanel(
  size: Signal<Vector2Tuple>,
  psRef: { pixelSize: number },
  orderInfo: Signal<OrderInfo>,
  parentClippingRect: Signal<ClippingRect | undefined>,
  rootGroupRef: { current: Group },
  subscriptions: Subscriptions,
): Mesh {
  const panel = new Mesh(panelGeometry)
  panel.matrixAutoUpdate = false
  panel.raycast = makeClippedRaycast(panel, makePanelRaycast(panel), rootGroupRef, parentClippingRect, orderInfo)
  panel.visible = false
  subscriptions.push(
    effect(() => {
      const [width, height] = size.value
      panel.scale.set(width * psRef.pixelSize, height * psRef.pixelSize, 1)
      panel.updateMatrix()
    }),
  )
  return panel
}

export type GetInstancedPanelGroup = (
  majorIndex: number,
  panelGroupDependencies: PanelGroupDependencies,
) => InstancedPanelGroup

export type PanelGroupDependencies = {
  materialClass: MaterialClass
} & ShadowProperties

const propertyKeys = ["materialClass", "castShadow", "receiveShadow"]

export function computePanelGroupDependencies(propertiesSignal: Signal<MergedProperties>) {
  const get = createGetBatchedProperties(propertiesSignal, propertyKeys)
  return computed<PanelGroupDependencies>(() => ({
    materialClass: get("materialClass") as MaterialClass | undefined ?? MeshBasicMaterial,
    castShadow: get("castShadow") as boolean | undefined,
    receiveShadow: get("receiveShadow") as boolean | undefined
  }))
}

export type ShadowProperties = { receiveShadow?: boolean; castShadow?: boolean }

export function createInstancePanel(
  propertiesSignal: Signal<MergedProperties>,
  orderInfo: Signal<OrderInfo>,
  panelGroupDependencies: Signal<PanelGroupDependencies>,
  getGroup: GetInstancedPanelGroup,
  matrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple>,
  offset: Signal<Vector2Tuple> | undefined,
  borderInset: Signal<Inset>,
  clippingRect: Signal<ClippingRect | undefined> | undefined,
  isHidden: Signal<boolean> | undefined,
  renameOutput?: Record<string, string>,
  subscriptions: Subscriptions) {
    subscriptions.push(effect(() => {
      const group = getGroup(orderInfo.value.majorIndex, panelGroupDependencies.value)
      const panel = new InstancedPanel(propertiesSignal, group, orderInfo.value.minorIndex, matrix, size, offset, borderInset, clippingRect, isHidden, renameOutput)
      return () => panel.destroy()
    }))
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
