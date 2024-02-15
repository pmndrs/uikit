import { Signal, signal, effect } from "@preact/signals-core";
import { InstancedBufferAttribute, Matrix4, Vector2Tuple } from "three";
import { Bucket } from "../allocation/sorted-buckets.js";
import { ClippingRect, defaultClippingData } from "../clipping.js";
import { Inset } from "../flex/node.js";
import { InstancedPanelGroup } from "./instanced-panel-group.js";
import { panelDefaultColor } from "./panel-material.js";
import { colorToBuffer } from "../utils.js";
import { Color as ColorRepresentation } from "@react-three/fiber";
import { WithImmediateProperties } from "../properties/immediate.js";
import { WithBatchedProperties } from "../properties/batched.js";
import { isPanelVisible, setBorderRadius } from "./utils.js";

export type PanelProperties = {
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  backgroundOpacity?: number;
  backgroundColor?: ColorRepresentation;
  borderColor?: ColorRepresentation;
  borderBend?: number;
  borderOpacity?: number;
};

const instancedPanelMaterialSetters: {
  [Key in keyof PanelProperties]-?: (
    group: InstancedPanelGroup,
    index: number,
    value: PanelProperties[Key],
    size: Signal<Vector2Tuple>,
  ) => void;
} = {
  //0-3 = borderSizes

  //4-6 = background color
  backgroundColor: (m, i, p) => colorToBuffer(m.instanceData, i, p ?? panelDefaultColor, 4),

  //7
  borderTopLeftRadius: (m, i, p, { value }) =>
    writeBorderRadius(m.instanceData, i, 7, 0, p, value[1]),
  borderTopRightRadius: (m, i, p, { value }) =>
    writeBorderRadius(m.instanceData, i, 7, 1, p, value[1]),
  borderBottomLeftRadius: (m, i, p, { value }) =>
    writeBorderRadius(m.instanceData, i, 7, 2, p, value[1]),
  borderBottomRightRadius: (m, i, p, { value }) =>
    writeBorderRadius(m.instanceData, i, 7, 3, p, value[1]),

  //8-10 = border color
  borderColor: (m, i, p) => colorToBuffer(m.instanceData, i, p ?? 0xffffff, 8),
  //11
  borderBend: (m, i, p) => writeComponent(m.instanceData, i, 11, p ?? 0),
  //12
  borderOpacity: (m, i, p) => writeComponent(m.instanceData, i, 12, p ?? 1),

  //13 = width
  //14 = height

  //15
  backgroundOpacity: (m, i, p) => writeComponent(m.instanceData, i, 15, p ?? -1),
};

const batchedProperties = ["borderOpacity", "backgroundColor", "backgroundOpacity"] as const;
type BatchedProperties = Pick<PanelProperties, (typeof batchedProperties)[number]>;
type BatchedPropertiesKey = keyof BatchedProperties;

export type InstancedPanelSetter =
  (typeof instancedPanelMaterialSetters)[keyof typeof instancedPanelMaterialSetters];

const matrixHelper1 = new Matrix4();
const matrixHelper2 = new Matrix4();

export class InstancedPanel
  implements WithImmediateProperties, WithBatchedProperties<BatchedProperties>
{
  private indexInBucket?: number;
  private bucket?: Bucket<unknown>;

  private unsubscribeList: Array<() => void> = [];

  private unsubscribeVisible: () => void;

  public destroyed = false;

  private insertedIntoGroup = false;

  active = signal(false);

  constructor(
    private group: InstancedPanelGroup,
    private matrix: Signal<Matrix4>,
    private size: Signal<Vector2Tuple>,
    private offset: Signal<Vector2Tuple> | undefined,
    private borderInset: Signal<Inset>,
    private clippingRect: Signal<ClippingRect | undefined> | undefined,
    isHidden: Signal<boolean> | undefined,
    private readonly depth: number,
  ) {
    this.unsubscribeVisible = effect(() => {
      const get = this.getProperty.value;
      if (
        isPanelVisible(
          borderInset,
          size,
          isHidden,
          get("borderOpacity"),
          get("backgroundOpacity"),
          get("backgroundColor"),
        )
      ) {
        this.requestShow();
        return;
      }
      this.hide();
    });
  }
  getProperty: Signal<<K extends BatchedPropertiesKey>(key: K) => BatchedProperties[K]> = signal(
    () => undefined,
  );

  hasBatchedProperty(key: BatchedPropertiesKey): boolean {
    return batchedProperties.includes(key);
  }

  hasImmediateProperty(key: string): boolean {
    return key in instancedPanelMaterialSetters;
  }

  setProperty(key: string, value: unknown) {
    instancedPanelMaterialSetters[key as keyof typeof instancedPanelMaterialSetters](
      this.group,
      this.getIndexInBuffer(),
      value as any,
      this.size,
    );
  }

  setIndexInBucket(index: number): void {
    this.indexInBucket = index;
  }

  private getIndexInBuffer(): number {
    return this.bucket!.offset + this.indexInBucket!;
  }

  public activate(bucket: Bucket<unknown>, index: number): void {
    this.bucket = bucket;
    this.indexInBucket = index;
    this.active.value = true;
    this.unsubscribeList.push(
      effect(() => {
        const { instanceMatrix, pixelSize } = this.group;
        const arrayIndex = this.getIndexInBuffer() * 16;
        const [width, height] = this.size.value;
        matrixHelper1.makeScale(width * pixelSize, height * pixelSize, 1);
        if (this.offset != null) {
          const [x, y] = this.offset.value;
          matrixHelper1.premultiply(matrixHelper2.makeTranslation(x * pixelSize, y * pixelSize, 0));
        }
        matrixHelper1.premultiply(this.matrix.value);
        matrixHelper1.toArray(instanceMatrix.array, arrayIndex);
        instanceMatrix.addUpdateRange(arrayIndex, 16);
        instanceMatrix.needsUpdate = true;
      }),
      effect(() => {
        const [width, height] = this.size.value;
        const { instanceData } = this.group;
        const { array } = instanceData;
        const bufferIndex = this.getIndexInBuffer() * 16 + 13;
        array[bufferIndex] = width;
        array[bufferIndex + 1] = height;
        instanceData.addUpdateRange(bufferIndex, 2);
        instanceData.needsUpdate = true;
      }),
      effect(() => {
        const { instanceData } = this.group;
        const offset = this.getIndexInBuffer() * 16 + 0;
        instanceData.array.set(this.borderInset.value, offset);
        instanceData.addUpdateRange(offset, 4);
        instanceData.needsUpdate = true;
      }),
      effect(() => {
        const { instanceClipping } = this.group;
        const offset = this.getIndexInBuffer() * 16;
        const clipping = this.clippingRect?.value;
        if (clipping != null) {
          clipping.toArray(instanceClipping.array, offset);
        } else {
          instanceClipping.array.set(defaultClippingData, offset);
        }
        instanceClipping.addUpdateRange(offset, 16);
        instanceClipping.needsUpdate = true;
      }),
    );
  }

  private requestShow(): void {
    if (this.insertedIntoGroup) {
      return;
    }
    this.insertedIntoGroup = true;
    this.group.insert(this.depth, this);
  }

  private hide(): void {
    if (!this.insertedIntoGroup) {
      return;
    }
    this.active.value = false;
    this.insertedIntoGroup = false;
    this.group.delete(this.depth, this.indexInBucket!, this);
    const unsubscribeListLength = this.unsubscribeList.length;
    for (let i = 0; i < unsubscribeListLength; i++) {
      this.unsubscribeList[i]();
    }
    this.unsubscribeList.length = 0;
  }

  destroy(): void {
    this.destroyed = true;
    this.hide();
    this.unsubscribeVisible();
  }
}

function writeBorderRadius(
  buffer: InstancedBufferAttribute,
  index: number,
  component: number,
  indexInFloat: number,
  value: number | undefined,
  height: number,
): void {
  const bufferIndex = index * buffer.itemSize + component;
  buffer.addUpdateRange(bufferIndex, 1);
  setBorderRadius(buffer.array, bufferIndex, indexInFloat, value, height);
  buffer.needsUpdate = true;
}

function writeComponent(
  buffer: InstancedBufferAttribute,
  index: number,
  component: number,
  value: number,
): void {
  const bufferIndex = index * buffer.itemSize + component;
  buffer.addUpdateRange(bufferIndex, 1);
  buffer.array[bufferIndex] = value;
  buffer.needsUpdate = true;
}
