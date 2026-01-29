import {
  Box3,
  BufferGeometry,
  InstancedBufferAttribute,
  InstancedInterleavedBuffer,
  InterleavedBufferAttribute,
  Mesh,
  Object3DEventMap,
  Sphere,
} from 'three'
import { createPanelGeometry } from './utils.js'
import { instancedPanelDepthMaterial, instancedPanelDistanceMaterial } from './panel-material.js'
import { RootContext } from '../context.js'

/**
 * Sets up split vec4 attributes from a 16-float-per-instance InstancedBufferAttribute.
 * TSL cannot read mat4 attributes directly, so we expose 4 vec4 views via InterleavedBufferAttribute.
 * The original mat4 attribute (for GLSL/onBeforeCompile) is kept as-is.
 */
function setupSplitAttributes(
  geometry: BufferGeometry,
  sourceAttr: InstancedBufferAttribute,
  baseName: string,
) {
  // Create an interleaved buffer backed by the same Float32Array
  const interleavedBuffer = new InstancedInterleavedBuffer(sourceAttr.array, 16)
  interleavedBuffer.setUsage(sourceAttr.usage)

  // 4 vec4 slices at offsets 0, 4, 8, 12 within each 16-float stride
  geometry.setAttribute(`${baseName}0`, new InterleavedBufferAttribute(interleavedBuffer, 4, 0, false))
  geometry.setAttribute(`${baseName}1`, new InterleavedBufferAttribute(interleavedBuffer, 4, 4, false))
  geometry.setAttribute(`${baseName}2`, new InterleavedBufferAttribute(interleavedBuffer, 4, 8, false))
  geometry.setAttribute(`${baseName}3`, new InterleavedBufferAttribute(interleavedBuffer, 4, 12, false))
}

export class InstancedPanelMesh extends Mesh {
  public count = 0
  public pointerEvents?: string

  protected readonly isInstancedMesh = true
  public readonly instanceColor = null
  public readonly morphTexture = null
  public readonly boundingBox = new Box3()
  public readonly boundingSphere = new Sphere()

  private readonly customUpdateMatrixWorld = () => {
    const parent = this.root.component.parent
    if (parent == null) {
      this.matrixWorld.identity()
    } else {
      this.matrixWorld.copy(parent.matrixWorld)
    }
  }

  constructor(
    private readonly root: Omit<RootContext, 'glyphGroupManager' | 'panelGroupManager'>,
    public readonly instanceMatrix: InstancedBufferAttribute,
    instanceData: InstancedBufferAttribute,
    instanceClipping: InstancedBufferAttribute,
  ) {
    const panelGeometry = createPanelGeometry()
    super(panelGeometry)
    this.pointerEvents = 'none'
    // Original mat4 attributes for GLSL onBeforeCompile path
    panelGeometry.attributes.aData = instanceData
    panelGeometry.attributes.aClipping = instanceClipping
    // Split vec4 attributes for TSL node material path
    setupSplitAttributes(panelGeometry, instanceData, 'aData')
    setupSplitAttributes(panelGeometry, instanceClipping, 'aClipping')
    this.customDepthMaterial = instancedPanelDepthMaterial
    this.customDistanceMaterial = instancedPanelDistanceMaterial
    this.frustumCulled = false
    root.onUpdateMatrixWorldSet.add(this.customUpdateMatrixWorld)
  }

  dispose() {
    this.root.onUpdateMatrixWorldSet.delete(this.customUpdateMatrixWorld)
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
