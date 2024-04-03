import { Box3, InstancedBufferAttribute, Mesh, Object3DEventMap, Sphere } from 'three'
import { createPanelGeometry, panelGeometry } from './utils.js'
import { instancedPanelDepthMaterial, instancedPanelDistanceMaterial } from './panel-material.js'
import { Signal, effect } from '@preact/signals-core'
import { Subscriptions } from '../utils.js'
import { makeClippedRaycast, makePanelRaycast } from './interaction-panel-mesh.js'
import { EventHandlers, KeyToEvent } from '../events.js'
import { OrderInfo } from '../order.js'
import { ClippingRect, FlexNode, RootContext } from '../internals.js'

export function createInteractionPanel(
  node: FlexNode,
  orderInfo: Signal<OrderInfo>,
  rootContext: RootContext,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  subscriptions: Subscriptions,
): Mesh {
  const panel = new Mesh(panelGeometry)
  panel.matrixAutoUpdate = false
  panel.raycast = makeClippedRaycast(panel, makePanelRaycast(panel), rootContext.object, parentClippingRect, orderInfo)
  panel.visible = false
  subscriptions.push(
    effect(() => {
      const [width, height] = node.size.value
      const pixelSize = rootContext.pixelSize
      panel.scale.set(width * pixelSize, height * pixelSize, 1)
      panel.updateMatrix()
    }),
  )
  return panel
}

export function cloneHandlers(handlers: EventHandlers): EventHandlers {
  return {
    onClick: handlers.onClick,
    onContextMenu: handlers.onContextMenu,
    onDoubleClick: handlers.onDoubleClick,
    onPointerCancel: handlers.onPointerCancel,
    onPointerDown: handlers.onPointerDown,
    onPointerEnter: handlers.onPointerEnter,
    onPointerLeave: handlers.onPointerLeave,
    onPointerMissed: handlers.onPointerMissed,
    onPointerMove: handlers.onPointerMove,
    onPointerOut: handlers.onPointerOut,
    onPointerOver: handlers.onPointerOver,
    onPointerUp: handlers.onPointerUp,
    onWheel: handlers.onWheel,
  }
}

export function addHandlers(target: EventHandlers, handlers: EventHandlers | undefined) {
  for (const key in handlers) {
    addHandler(key as any, target, handlers[key as never])
  }
}

export function addHandler<K extends keyof EventHandlers>(
  key: K,
  target: EventHandlers,
  handler: (event: KeyToEvent<K>) => void,
): void {
  const existingHandler = target[key]
  if (existingHandler == null) {
    target[key] = handler
    return
  }
  target[key] = (e: KeyToEvent<K>) => {
    existingHandler(e as any)
    if ('stopped' in e && e.stopped) {
      return
    }
    handler(e)
  }
}

export class InstancedPanelMesh extends Mesh {
  public count = 0

  protected readonly isInstancedMesh = true
  public readonly instanceColor = null
  public readonly morphTexture = null
  public readonly boundingBox = new Box3()
  public readonly boundingSphere = new Sphere()

  constructor(
    public readonly instanceMatrix: InstancedBufferAttribute,
    instanceData: InstancedBufferAttribute,
    instanceClipping: InstancedBufferAttribute,
  ) {
    const panelGeometry = createPanelGeometry()
    super(panelGeometry)
    this.frustumCulled = false
    panelGeometry.attributes.aData = instanceData
    panelGeometry.attributes.aClipping = instanceClipping
    this.customDepthMaterial = instancedPanelDepthMaterial
    this.customDistanceMaterial = instancedPanelDistanceMaterial
  }

  dispose() {
    this.dispatchEvent({ type: 'dispose' as keyof Object3DEventMap })
  }

  copy(): this {
    throw new Error('copy not implemented')
  }

  //functions not needed because intersection (and morphing) is intenionally disabled
  computeBoundingBox(): void {}
  computeBoundingSphere(): void {}
  updateMorphTargets(): void {}
  raycast(): void {}
  spherecast(): void {}
}
