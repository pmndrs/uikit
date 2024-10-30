import { Box3, InstancedBufferAttribute, Mesh, Object3DEventMap, Sphere, Vector2Tuple } from 'three'
import { createPanelGeometry, panelGeometry } from './utils.js'
import { instancedPanelDepthMaterial, instancedPanelDistanceMaterial } from './panel-material.js'
import { Signal, effect } from '@preact/signals-core'
import { Initializers } from '../utils.js'
import { makeClippedCast, makePanelRaycast, makePanelSpherecast } from './interaction-panel-mesh.js'
import { OrderInfo } from '../order.js'
import { ClippingRect } from '../clipping.js'
import { RootContext } from '../context.js'

export function createInteractionPanel(
  orderInfo: Signal<OrderInfo | undefined>,
  rootContext: RootContext,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  size: Signal<Vector2Tuple | undefined>,
  initializers: Initializers,
): Mesh {
  const panel = new Mesh(panelGeometry)
  panel.matrixAutoUpdate = false
  panel.raycast = makeClippedCast(panel, makePanelRaycast(panel), rootContext.object, parentClippingRect, orderInfo)
  panel.spherecast = makeClippedCast(
    panel,
    makePanelSpherecast(panel),
    rootContext.object,
    parentClippingRect,
    orderInfo,
  )
  panel.visible = false
  initializers.push(() =>
    effect(() => {
      if (size.value == null) {
        return
      }
      const [width, height] = size.value
      const pixelSize = rootContext.pixelSize.value
      panel.scale.set(width * pixelSize, height * pixelSize, 1)
      panel.updateMatrix()
    }),
  )
  return panel
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
