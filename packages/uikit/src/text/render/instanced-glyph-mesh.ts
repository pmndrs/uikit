import { Box3, InstancedBufferAttribute, Material, Mesh, Object3DEventMap, PlaneGeometry, Sphere } from 'three'

export class InstancedGlyphMesh extends Mesh {
  public count = 0

  protected readonly isInstancedMesh = true
  public readonly instanceColor = null
  public readonly morphTexture = null
  public readonly boundingBox = new Box3()
  public readonly boundingSphere = new Sphere()

  constructor(
    public readonly instanceMatrix: InstancedBufferAttribute,
    public readonly instanceRGBA: InstancedBufferAttribute,
    public readonly instanceUV: InstancedBufferAttribute,
    public readonly instanceClipping: InstancedBufferAttribute,
    material: Material,
  ) {
    const planeGeometry = new PlaneGeometry()
    planeGeometry.translate(0.5, -0.5, 0)
    super(planeGeometry, material)
    planeGeometry.attributes.instanceUVOffset = instanceUV
    planeGeometry.attributes.instanceRGBA = instanceRGBA
    planeGeometry.attributes.instanceClipping = instanceClipping
    this.frustumCulled = false
  }

  copy(): this {
    throw new Error('copy not implemented')
  }

  dispose() {
    this.dispatchEvent({ type: 'dispose' as keyof Object3DEventMap })
    this.geometry.dispose()
  }

  //functions not needed because intersection (and morphing) is intenionally disabled
  computeBoundingBox(): void {}
  computeBoundingSphere(): void {}
  updateMorphTargets(): void {}
  raycast(): void {}
  spherecast(): void {}
}
