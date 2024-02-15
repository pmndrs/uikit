import { DynamicDrawUsage, Group, InstancedBufferAttribute, Material, TypedArray } from "three";
import { InstancedGlyph } from "./instanced-glyph.js";
import { InstancedGlyphMesh } from "./instanced-glyph-mesh.js";
import { InstancedGlyphMaterial } from "./instanced-gylph-material.js";
import { Font } from "../font.js";
import { setRootIdentifier } from "../../components/utils.js";

export class InstancedGlyphGroup extends Group {
  public instanceMatrix!: InstancedBufferAttribute;
  public instanceUV!: InstancedBufferAttribute;
  public instanceRGBA!: InstancedBufferAttribute;
  public instanceClipping!: InstancedBufferAttribute;

  private glyphs: Array<InstancedGlyph | undefined> = [];
  private requestedGlyphs: Array<InstancedGlyph> = [];
  private holeIndicies: Array<number> = [];
  private mesh?: InstancedGlyphMesh;

  private material: Material;

  constructor(
    font: Font,
    public readonly pixelSize: number,
    private readonly rootIdentifier: unknown,
  ) {
    super();
    this.material = new InstancedGlyphMaterial(font);
  }

  requestActivate(glyph: InstancedGlyph): void {
    const holeIndex = this.holeIndicies.shift();
    if (holeIndex != null) {
      this.glyphs[holeIndex] = glyph;
      glyph.activate(holeIndex);
      return;
    }
    if (this.mesh != null && this.mesh.count < this.instanceMatrix.count) {
      const index = this.mesh.count;
      this.glyphs[index] = glyph;
      glyph.activate(index);
      this.mesh.count += 1;
      return;
    }
    this.requestedGlyphs.push(glyph);
  }

  delete(glyph: InstancedGlyph): void {
    if (glyph.index == null) {
      const indexInRequested = this.requestedGlyphs.indexOf(glyph);
      if (indexInRequested === -1) {
        return;
      }
      this.requestedGlyphs.splice(indexInRequested, 1);
      return;
    }
    if (glyph.index === this.glyphs.length - 1) {
      this.glyphs.length -= 1;
      this.mesh!.count -= 1;
      return;
    }
    //hiding the glyph by writing a 0 matrix (0 scale ...)
    const bufferOffset = glyph.index * 16;
    this.instanceMatrix.array.fill(0, bufferOffset, bufferOffset + 16);
    this.instanceMatrix.addUpdateRange(bufferOffset, 16);
    this.instanceMatrix.needsUpdate = true;
    this.holeIndicies.push(glyph.index);
    glyph.index = undefined;
  }

  onFrame(): void {
    const requestedGlyphsLength = this.requestedGlyphs.length;
    const neededSize = this.glyphs.length - this.holeIndicies.length + requestedGlyphsLength;
    if (neededSize === 0) {
      this.visible = false;
      return;
    }
    this.visible = true;
    const availableSize = this.instanceMatrix?.count ?? 0;
    if (availableSize / 3 < neededSize && neededSize <= availableSize) {
      return;
    }
    this.resize(neededSize);
    const indexOffset = this.mesh!.count;
    for (let i = 0; i < requestedGlyphsLength; i++) {
      const glyph = this.requestedGlyphs[i];
      glyph.activate(indexOffset + i);
      this.glyphs[indexOffset + i] = glyph;
    }
    this.mesh!.count += requestedGlyphsLength;
    this.requestedGlyphs.length = 0;
  }

  private resize(neededSize: number): void {
    const newSize = Math.ceil(neededSize * 1.5);
    const matrixArray = new Float32Array(newSize * 16);
    const uvArray = new Float32Array(newSize * 4);
    const rgbaArray = new Float32Array(newSize * 4);
    const clippingArray = new Float32Array(newSize * 16);
    this.instanceMatrix = new InstancedBufferAttribute(matrixArray, 16, false);
    this.instanceMatrix.setUsage(DynamicDrawUsage);
    this.instanceUV = new InstancedBufferAttribute(uvArray, 4, false);
    this.instanceUV.setUsage(DynamicDrawUsage);
    this.instanceRGBA = new InstancedBufferAttribute(rgbaArray, 4, false);
    this.instanceRGBA.setUsage(DynamicDrawUsage);
    this.instanceClipping = new InstancedBufferAttribute(clippingArray, 16, false);
    this.instanceClipping.setUsage(DynamicDrawUsage);
    const oldMesh = this.mesh;
    this.mesh = new InstancedGlyphMesh(
      this.instanceMatrix,
      this.instanceRGBA,
      this.instanceUV,
      this.instanceClipping,
      this.material,
    );

    //copy over old arrays and merging the holes
    if (oldMesh != null) {
      this.holeIndicies.sort((i1, i2) => i1 - i2);
      const holesLength = this.holeIndicies.length;
      let afterPrevHoleIndex = 0;
      let i = 0;
      while (i < holesLength) {
        const holeIndex = this.holeIndicies[i];
        copyBuffer(afterPrevHoleIndex - i, afterPrevHoleIndex, holeIndex, oldMesh, this.mesh);
        afterPrevHoleIndex = holeIndex + 1;
        this.glyphs.splice(holeIndex - i, 1);
        i++;
      }
      copyBuffer(afterPrevHoleIndex - i, afterPrevHoleIndex, oldMesh.count, oldMesh, this.mesh);

      if (this.holeIndicies.length > 0) {
        for (let i = this.holeIndicies[0]; i < this.glyphs.length; i++) {
          this.glyphs[i]!.setIndex(i);
        }
      }
      this.holeIndicies.length = 0;

      //destroying the old mesh
      this.remove(oldMesh);
      oldMesh.dispose();
    }

    //finalizing the new mesh
    setRootIdentifier(this.mesh, this.rootIdentifier, "Text");
    this.mesh.count = this.glyphs.length;
    this.add(this.mesh);
  }
}

function copyBuffer(
  target: number,
  start: number,
  end: number,
  oldMesh: InstancedGlyphMesh,
  newMesh: InstancedGlyphMesh,
) {
  copy(target, start, end, oldMesh.instanceMatrix.array, newMesh.instanceMatrix.array, 16);
  copy(target, start, end, oldMesh.instanceUV.array, newMesh.instanceUV.array, 4);
  copy(target, start, end, oldMesh.instanceRGBA.array, newMesh.instanceRGBA.array, 4);
  copy(target, start, end, oldMesh.instanceClipping.array, newMesh.instanceClipping.array, 16);
}

function copy(
  target: number,
  start: number,
  end: number,
  from: TypedArray,
  to: TypedArray,
  itemSize: number,
): void {
  if (start === end) {
    return;
  }
  const targetIndex = target * itemSize;
  const startIndex = start * itemSize;
  const endIndex = end * itemSize;
  to.set(from.subarray(startIndex, endIndex), targetIndex);
}
