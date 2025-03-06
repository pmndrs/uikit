import { Box3, InstancedBufferAttribute, Matrix4, Mesh, Object3DEventMap, Sphere, Vector2Tuple } from 'three'
import { createPanelGeometry, panelGeometry } from './utils.js'
import { instancedPanelDepthMaterial, instancedPanelDistanceMaterial } from './panel-material.js'
import { Signal } from '@preact/signals-core'
import { abortableEffect } from '../utils.js'
import {
  setupBoundingSphere,
  makeClippedCast,
  makePanelRaycast,
  makePanelSpherecast,
} from './interaction-panel-mesh.js'
import { OrderInfo } from '../order.js'
import { ClippingRect } from '../clipping.js'
import { RootContext } from '../context.js'
import { FlexNodeState } from '../internals.js'

export function createInteractionPanel(
  orderInfo: Signal<OrderInfo | undefined>,
  rootContext: RootContext,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  globalMatrix: Signal<Matrix4 | undefined>,
  flexState: FlexNodeState,
) {
  const boundingSphere = new Sphere()
  const panel = Object.assign(new Mesh(panelGeometry), { boundingSphere })
  panel.matrixAutoUpdate = false

  const rootObjectRef = rootContext.objectRef
  panel.raycast = makeClippedCast(
    panel,
    makePanelRaycast(panel.raycast.bind(panel), rootObjectRef, boundingSphere, globalMatrix, panel),
    rootContext.objectRef,
    parentClippingRect,
    orderInfo,
    flexState,
  )
  panel.spherecast = makeClippedCast(
    panel,
    makePanelSpherecast(rootObjectRef, boundingSphere, globalMatrix, panel),
    rootContext.objectRef,
    parentClippingRect,
    orderInfo,
    flexState,
  )
  panel.visible = false
  return panel
}

export function setupInteractionPanel(
  panel: Mesh & { boundingSphere: Sphere },
  rootContext: RootContext,
  globalMatrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  abortSignal: AbortSignal,
) {
  setupBoundingSphere(panel.boundingSphere, rootContext.pixelSize, globalMatrix, size, abortSignal)
  abortableEffect(() => {
    if (size.value == null) {
      return
    }
    const [width, height] = size.value
    const pixelSize = rootContext.pixelSize.value
    panel.scale.set(width * pixelSize, height * pixelSize, 1)
    panel.updateMatrix()
  }, abortSignal)
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
    this.geometry.dispose()
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
