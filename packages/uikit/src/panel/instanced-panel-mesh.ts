import { Box3, InstancedBufferAttribute, Mesh, Object3DEventMap, Sphere } from "three";
import { createPanelGeometry } from "./utils.js";

export class InstancedPanelMesh extends Mesh {
  public count = 0;

  protected readonly isInstancedMesh = true;
  public readonly instanceColor = null;
  public readonly boundingBox = new Box3();
  public readonly boundingSphere = new Sphere();

  constructor(
    public readonly instanceMatrix: InstancedBufferAttribute,
    instanceData: InstancedBufferAttribute,
    instanceClipping: InstancedBufferAttribute,
  ) {
    const panelGeometry = createPanelGeometry();
    super(panelGeometry);
    this.frustumCulled = false;
    panelGeometry.attributes.aData = instanceData;
    panelGeometry.attributes.aClipping = instanceClipping;
    this.frustumCulled = false;
  }

  dispose() {
    this.dispatchEvent({ type: "dispose" as keyof Object3DEventMap });
  }

  copy(): this {
    throw new Error("copy not implemented");
  }

  //functions not needed because intersection (and morphing) is intenionally disabled
  computeBoundingBox(): void {}
  computeBoundingSphere(): void {}
  updateMorphTargets(): void {}
  raycast(): void {}
  spherecast(): void {}
}
